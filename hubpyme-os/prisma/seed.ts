import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { id: "demo-org-001" },
    update: {},
    create: {
      id: "demo-org-001",
      name: "Demo PyME S.A.",
      cuit: "30-12345678-9",
    },
  });

  console.log(`✅ Organization created: ${org.name}`);

  // Create admin user
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      passwordHash,
      name: "Administrador",
      role: "OWNER",
      organizationId: org.id,
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);
  console.log("\n📋 Demo credentials:");
  console.log("   Email:    admin@demo.com");
  console.log("   Password: demo1234");
  console.log("\n✨ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
