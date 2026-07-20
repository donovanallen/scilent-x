import 'dotenv/config';
import { hashPassword } from 'better-auth/crypto';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type SeedUser = {
  email: string;
  name: string;
  username: string;
  bio: string;
  role: 'admin' | 'user';
  emailVerified?: boolean;
};

/**
 * Production / Vercel Production: seed only the admin credential account.
 * Local / preview / other: also seed mock profile users for impersonation.
 */
function isProductionSeed(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  );
}

/**
 * Resolve admin credentials for seeding.
 *
 * Local defaults: admin@scilent.local / password123
 * Production: requires SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD (or
 * SEED_USER_PASSWORD as a password fallback). No weak defaults in prod.
 */
function resolveAdminSeed(): {
  user: SeedUser;
  password: string;
  production: boolean;
} {
  const production = isProductionSeed();
  const email =
    process.env.SEED_ADMIN_EMAIL?.trim() ||
    (production ? '' : 'admin@scilent.local');
  const password =
    process.env.SEED_ADMIN_PASSWORD?.trim() ||
    process.env.SEED_USER_PASSWORD?.trim() ||
    (production ? '' : 'password123');
  const username = process.env.SEED_ADMIN_USERNAME?.trim() || 'admin';
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Scilent Admin';

  if (production) {
    const missing: string[] = [];
    if (!email) missing.push('SEED_ADMIN_EMAIL');
    if (!password) missing.push('SEED_ADMIN_PASSWORD (or SEED_USER_PASSWORD)');
    if (missing.length > 0) {
      throw new Error(
        `Production admin seed requires ${missing.join(' and ')}. ` +
          'Set these env vars before running `pnpm db:seed` against a production database.'
      );
    }
    if (password.length < 12) {
      throw new Error(
        'Production SEED_ADMIN_PASSWORD must be at least 12 characters.'
      );
    }
  }

  return {
    production,
    password,
    user: {
      email,
      name,
      username,
      bio: production
        ? 'Bootstrap admin account for admin tooling.'
        : 'Development admin account for impersonation and admin tooling.',
      role: 'admin',
      emailVerified: true,
    },
  };
}

/**
 * Mock users with basic profiles and email/password credentials.
 * Local / non-production only — never seeded in production.
 */
const MOCK_USERS: SeedUser[] = [
  {
    email: 'alice@scilent.local',
    name: 'Alice Rivers',
    username: 'alice',
    bio: 'Indie pop listener. Always digging for B-sides.',
    role: 'user',
    emailVerified: true,
  },
  {
    email: 'bob@scilent.local',
    name: 'Bob Chen',
    username: 'bob',
    bio: 'Jazz and ambient crate digger.',
    role: 'user',
    emailVerified: true,
  },
  {
    email: 'carol@scilent.local',
    name: 'Carol Okonkwo',
    username: 'carol',
    bio: 'Electronic music producer and playlist curator.',
    role: 'user',
    emailVerified: false,
  },
];

async function upsertSeedUser(
  user: SeedUser,
  hashedPassword: string
): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  const userRecord = existing
    ? await prisma.user.update({
        where: { email: user.email },
        data: {
          name: user.name,
          username: user.username,
          bio: user.bio,
          role: user.role,
          emailVerified: user.emailVerified ?? false,
          banned: false,
          banReason: null,
          banExpires: null,
        },
      })
    : await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          username: user.username,
          bio: user.bio,
          role: user.role,
          emailVerified: user.emailVerified ?? false,
          banned: false,
        },
      });

  const credentialAccount = await prisma.account.findUnique({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: userRecord.id,
      },
    },
  });

  if (credentialAccount) {
    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: { password: hashedPassword },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: userRecord.id,
        accountId: userRecord.id,
        providerId: 'credential',
        password: hashedPassword,
      },
    });
  }

  console.log(
    `  ✓ ${user.email} (${user.role})${existing ? ' [updated]' : ' [created]'}`
  );
}

async function main() {
  const { user: admin, password, production } = resolveAdminSeed();

  if (production) {
    console.log('🌱 Seeding production admin account...');
    console.log(`   Email: ${admin.email}`);
    console.log('   Password: (from SEED_ADMIN_PASSWORD / SEED_USER_PASSWORD)');
  } else {
    console.log('🌱 Seeding mock users...');
    console.log(`   Password for all seeded accounts: ${password}`);
  }

  const hashedPassword = await hashPassword(password);
  const users: SeedUser[] = production ? [admin] : [admin, ...MOCK_USERS];

  for (const user of users) {
    await upsertSeedUser(user, hashedPassword);
  }

  console.log('✅ Seed completed.');
  console.log('');
  if (production) {
    console.log(
      `Sign in as ${admin.email} to use Admin → Users. Rotate SEED_ADMIN_PASSWORD after first login if it was shared.`
    );
  } else {
    console.log(
      `Sign in as ${admin.email} to use Admin → Users → Impersonate.`
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
