import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding users...");

  // Hash the admin password
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@taxlegit.com" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@taxlegit.com",
        password: hashedPassword,
        phone: "",
        role: "ADMIN",
      },
    });
  }

  // -----------------------------
  // SAMPLE USERS
  // -----------------------------
  async function createUserIfNotExists(
    phone: string,
    firstName: string,
    lastName: string
  ) {
    let user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { firstName, lastName, phone },
      });
    }
    return user;
  }

  const user1 = await createUserIfNotExists("1234567890", "John", "Doe");
  const user2 = await createUserIfNotExists("9876543210", "Jane", "Smith");
  const user3 = await createUserIfNotExists("5556667777", "Alice", "Johnson");

  console.log("Users seeded:", { adminUser, user1, user2, user3 });

  // -----------------------------
  // ❌ NO PLAN SEEDING ANYMORE
  // -----------------------------
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
