import { db } from '../src/client';

async function main(): Promise<void> {
  await db.$queryRaw`SELECT 1`;
  console.log('✅ Connected.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
