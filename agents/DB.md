# Database Agent Instructions

This document provides step-by-step instructions for AI agents working with the database layer
in the **scilent-one** monorepo.

---

## Database Package Overview

The database layer is provided by `@scilent-one/db` located at `packages/db/`.

### Key Technologies

- **ORM:** Prisma v7 with `prisma-client` generator
- **Database:** PostgreSQL (default)
- **Adapter:** `@prisma/adapter-pg` for direct connections
- **Configuration:** `prisma.config.ts` (Prisma v7 style)

### Package Structure

```bash
packages/db/
├── .env.example              # Environment template
├── .env                      # Local environment (gitignored)
├── package.json
├── prisma.config.ts          # Prisma v7 configuration
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── generated/            # Generated client (gitignored)
│   ├── migrations/           # Migration files
│   └── seed.ts               # Seed script (optional)
├── src/
│   ├── client.ts             # Singleton client with adapter
│   └── index.ts              # Package exports
└── tsconfig.json
```

---

## Pre-Development Checklist

Before making database changes, verify:

1. **Read current schema:**

   ```bash
   cat packages/db/prisma/schema.prisma
   ```

2. **Check existing models and relationships:**
   - User, Account, Session, VerificationToken are the base models
   - Relationships use `@relation` directives

3. **Understand the client setup:**

   ```bash
   cat packages/db/src/client.ts
   ```

   Key points:
   - Uses `PrismaPg` adapter with connection string from env
   - Singleton pattern for hot-reload safety
   - Exports as `db`

4. **Check environment:**

   ```bash
   cat packages/db/.env.example
   ```

---

## Common Database Tasks

### Adding a New Model

1. **Edit the schema** at `packages/db/prisma/schema.prisma`:

   ```prisma
   model Post {
     id        String   @id @default(cuid())
     title     String
     content   String?
     published Boolean  @default(false)
     authorId  String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

     @@index([authorId])
     @@map("posts")
   }
   ```

2. **Add relation to User model** (if applicable):

   ```prisma
   model User {
     // ... existing fields
     posts Post[]
   }
   ```

3. **Update type exports** in `packages/db/src/index.ts`:

   ```typescript
   export type {
     User,
     Account,
     Session,
     VerificationToken,
     Post, // Add new model
   } from '../prisma/generated/client.js';
   ```

4. **Generate and push:**

   ```bash
   cd packages/db
   pnpm db:generate
   pnpm db:push  # or db:migrate for production
   ```

### Modifying an Existing Model

1. **Make changes to schema**
2. **Generate client:** `pnpm db:generate`
3. **For development:** `pnpm db:push`
4. **For production:** `pnpm db:migrate`

### Adding Indexes

Always add indexes for:

- Foreign key fields (`userId`, `authorId`, etc.)
- Fields used in WHERE clauses frequently
- Fields used in ORDER BY

```prisma
@@index([userId])
@@index([createdAt])
@@index([email, createdAt])  // Composite index
```

### Adding Unique Constraints

```prisma
@@unique([provider, providerAccountId])
@@unique([email, organizationId])
```

---

## Schema Best Practices

### Naming Conventions

- **Model names:** PascalCase singular (`User`, `Post`, `Comment`)
- **Field names:** camelCase (`createdAt`, `userId`)
- **Table names:** Use `@@map("table_name")` for snake_case tables
- **Index names:** Prisma generates automatically

### Required Fields

Every model should have:

```prisma
model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ... other fields

  @@map("examples")
}
```

### Relationships

```prisma
// One-to-many
model User {
  posts Post[]
}

model Post {
  authorId String
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
}

// Many-to-many (implicit)
model Post {
  tags Tag[]
}

model Tag {
  posts Post[]
}

// Many-to-many (explicit)
model PostTag {
  postId String
  tagId  String

  post Post @relation(fields: [postId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}
```

### Soft Deletes

If implementing soft deletes:

```prisma
model Post {
  // ... other fields
  deletedAt DateTime?

  @@index([deletedAt])
}
```

---

## Client Usage Patterns

### Basic CRUD

```typescript
import { db } from '@scilent-one/db';

// Create
const user = await db.user.create({
  data: { email: 'user@example.com', name: 'User' },
});

// Read
const users = await db.user.findMany({
  where: { emailVerified: { not: null } },
  orderBy: { createdAt: 'desc' },
});

// Update
await db.user.update({
  where: { id: 'user-id' },
  data: { name: 'New Name' },
});

// Delete
await db.user.delete({
  where: { id: 'user-id' },
});
```

### Relations

```typescript
// Include relations
const userWithPosts = await db.user.findUnique({
  where: { id: 'user-id' },
  include: { posts: true, accounts: true },
});

// Nested creates
const userWithPost = await db.user.create({
  data: {
    email: 'user@example.com',
    posts: {
      create: { title: 'First Post' },
    },
  },
  include: { posts: true },
});
```

### Transactions

```typescript
const [user, post] = await db.$transaction([
  db.user.create({ data: { email: 'user@example.com' } }),
  db.post.create({ data: { title: 'Post', authorId: 'temp' } }),
]);

// Or interactive transaction
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'user@example.com' } });
  await tx.post.create({ data: { title: 'Post', authorId: user.id } });
});
```

---

## Migration Guidelines

### When to Use Migrations vs Push

| Scenario                      | Command                |
| ----------------------------- | ---------------------- |
| Local development/prototyping | `db:push`              |
| Production database           | `db:migrate`           |
| CI/CD pipeline                | `db:migrate:deploy`    |
| Resetting local database      | `prisma migrate reset` |

### Creating Migrations

```bash
cd packages/db
pnpm db:migrate
```

Prisma will prompt for a migration name. Use descriptive names:

- `add_posts_table`
- `add_index_to_users_email`
- `add_soft_delete_to_posts`

### Migration Files

Never edit existing migration files. If you need to change something:

1. Create a new migration with the fix
2. Or reset the database during development

---

## Environment Configuration

### Required Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Connection String Formats

| Provider         | Format                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Local PostgreSQL | `postgresql://postgres:postgres@localhost:5432/mydb`                                  |
| Supabase         | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| Neon             | `postgresql://[user]:[pass]@[endpoint].neon.tech/[db]?sslmode=require`                |
| Railway          | `postgresql://postgres:[pass]@[host].railway.app:5432/railway`                        |

---

## Troubleshooting

### Common Errors

| Error                                                | Solution                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `Cannot find module '../prisma/generated/client.js'` | Run `pnpm db:generate`                                     |
| `Environment variable not found: DATABASE_URL`       | Create `.env` file in `packages/db/`                       |
| `P1001: Can't reach database server`                 | Check database is running and connection string is correct |
| `P2002: Unique constraint failed`                    | Data already exists with that unique value                 |
| `P2025: Record not found`                            | The record you're trying to update/delete doesn't exist    |

### Resetting Development Database

```bash
cd packages/db
pnpm prisma migrate reset
```

This will:

1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed script (if configured)

### Regenerating Client

If types seem outdated:

```bash
cd packages/db
rm -rf prisma/generated
pnpm db:generate
```

---

## Quick Reference Commands

```bash
# From monorepo root
pnpm --filter @scilent-one/db db:generate   # Generate client
pnpm --filter @scilent-one/db db:push       # Push schema (dev)
pnpm --filter @scilent-one/db db:migrate    # Create migration
pnpm --filter @scilent-one/db db:studio     # Open Prisma Studio

# From packages/db directory
cd packages/db
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
pnpm prisma migrate reset   # Reset database
pnpm prisma db seed         # Run seed script
```

---

## Integration with Next.js

### Server Components

```typescript
// app/users/page.tsx
import { db } from '@scilent-one/db';

export default async function UsersPage() {
  const users = await db.user.findMany();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### API Routes

```typescript
// app/api/users/route.ts
import { db } from '@scilent-one/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  const user = await db.user.create({ data });
  return NextResponse.json(user, { status: 201 });
}
```

### Server Actions

```typescript
// app/actions/user.ts
'use server';

import { db } from '@scilent-one/db';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  await db.user.create({ data: { email, name } });
  revalidatePath('/users');
}
```

---

## Post-Change Checklist

After making database changes:

- [ ] Schema changes are valid (`pnpm db:generate` succeeds)
- [ ] Types are exported in `src/index.ts` if new models were added
- [ ] Indexes are added for foreign keys and frequently queried fields
- [ ] `@@map()` is used for snake_case table names
- [ ] Related models have proper `@relation` directives
- [ ] `onDelete` behavior is specified for relations
- [ ] Migration is created for production changes
- [ ] Application code using the database still compiles

---

_Last updated: December 28, 2025_
