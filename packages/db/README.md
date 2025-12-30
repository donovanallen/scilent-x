# @scilent-one/db

Prisma database client package for the scilent-one monorepo.

## Setup

### 1. Configure Environment

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
```

### 2. Generate Prisma Client

```bash
pnpm db:generate
```

### 3. Run Migrations

```bash
# Development - create and apply migrations
pnpm db:migrate

# Production - apply existing migrations
pnpm db:migrate:deploy
```

### 4. (Alternative) Push Schema

For prototyping without migrations:

```bash
pnpm db:push
```

## Usage

Import the database client in your application:

```typescript
import { db } from '@scilent-one/db';

// Query examples
const users = await db.user.findMany();

const user = await db.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});
```

## Available Scripts

| Script                   | Description                             |
| ------------------------ | --------------------------------------- |
| `pnpm db:generate`       | Generate Prisma Client                  |
| `pnpm db:migrate`        | Create and run migrations (development) |
| `pnpm db:migrate:deploy` | Run migrations (production)             |
| `pnpm db:push`           | Push schema changes without migrations  |
| `pnpm db:studio`         | Open Prisma Studio GUI                  |
| `pnpm db:seed`           | Run database seed script                |

## Schema

The database includes the following models:

- **User** - Core user model with authentication fields
- **Account** - OAuth provider accounts (ready for NextAuth.js)
- **Session** - User sessions for authentication
- **VerificationToken** - Email verification and password reset tokens

## Extending the Schema

1. Edit `prisma/schema.prisma`
2. Run `pnpm db:migrate` to create a migration
3. The Prisma Client will be regenerated automatically

## Database Providers

The default provider is PostgreSQL. To use a different database:

1. Update the `provider` in `prisma/schema.prisma`
2. Update your `DATABASE_URL` format accordingly

Supported providers:

- `postgresql`
- `mysql`
- `sqlite`
- `mongodb`
- `cockroachdb`

See [Prisma Datasource Documentation](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) for more details.
