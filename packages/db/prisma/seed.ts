import "dotenv/config";
import { PrismaClient } from "./generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Add your seed data here
  // Example:
  // const user = await prisma.user.upsert({
  //   where: { email: "test@example.com" },
  //   update: {},
  //   create: {
  //     email: "test@example.com",
  //     name: "Test User",
  //   },
  // });
  // console.log({ user });

  console.log("✅ Seed completed.");
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
