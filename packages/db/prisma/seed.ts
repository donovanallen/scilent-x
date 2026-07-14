import 'dotenv/config';
import { hashPassword } from 'better-auth/crypto';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * Default password for all seeded credential accounts.
 * Override with SEED_USER_PASSWORD when seeding shared/dev environments.
 */
const SEED_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'password123';

type SeedUser = {
  email: string;
  name: string;
  username: string;
  bio: string;
  role: 'admin' | 'user';
  emailVerified?: boolean;
};

/**
 * Mock users with basic profiles and email/password credentials.
 * No OAuth / streaming providers are linked — use impersonation or
 * email sign-in to exercise the app as these accounts.
 */
const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@scilent.local',
    name: 'Scilent Admin',
    username: 'admin',
    bio: 'Development admin account for impersonation and admin tooling.',
    role: 'admin',
    emailVerified: true,
  },
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
  console.log('🌱 Seeding mock users...');
  console.log(`   Password for all seeded accounts: ${SEED_PASSWORD}`);

  const hashedPassword = await hashPassword(SEED_PASSWORD);

  for (const user of SEED_USERS) {
    await upsertSeedUser(user, hashedPassword);
  }

  console.log('✅ Seed completed.');
  console.log('');
  console.log(
    'Sign in as admin@scilent.local to use Admin → Users → Impersonate.'
  );
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
