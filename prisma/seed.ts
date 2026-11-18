import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const branch = await db.branch.upsert({
    where: { code: "CHRASTANY" },
    update: {},
    create: { code: "CHRASTANY", name: "Chrášťany" },
  });
  const front = await db.workplace.upsert({
    where: { branchId_code: { branchId: branch.id, code: "FRONT" } },
    update: {},
    create: {
      branchId: branch.id,
      code: "FRONT",
      name: "Prodejna / předek",
      color: "#38b26d",
    },
  });
  await db.workplace.upsert({
    where: { branchId_code: { branchId: branch.id, code: "WAREHOUSE" } },
    update: {},
    create: {
      branchId: branch.id,
      code: "WAREHOUSE",
      name: "Sklad / zázemí",
      color: "#657fd0",
    },
  });
  for (const [name, shortCode, isLeadership] of [
    ["Sales Specialist", "SS", false],
    ["Skladník", "SKLAD", false],
    ["Brigádník", "BRIGÁDNÍK", false],
    ["Team Leader", "TL", true],
    ["Store Team Leader", "STL", true],
    ["Vedoucí skladu", "VS", true],
  ] as const)
    await db.jobPosition.upsert({
      where: { shortCode },
      update: {},
      create: { name, shortCode, isLeadership },
    });
  const hash = await bcrypt.hash("Zmenit-Heslo-2026!", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@smeny.local" },
    update: {},
    create: {
      email: "admin@smeny.local",
      passwordHash: hash,
      firstName: "Jan",
      lastName: "Novák",
      role: "ADMIN",
      status: "ACTIVE",
      isPrimaryAdmin: true,
      branchId: branch.id,
      defaultWorkplaceId: front.id,
    },
  });
  await db.user.upsert({
    where: { email: "manager@smeny.local" },
    update: {},
    create: {
      email: "manager@smeny.local",
      passwordHash: hash,
      firstName: "Lucie",
      lastName: "Malá",
      role: "MANAGER",
      status: "ACTIVE",
      branchId: branch.id,
      defaultWorkplaceId: front.id,
    },
  });
  await db.user.upsert({
    where: { email: "cekajici@example.cz" },
    update: {},
    create: {
      email: "cekajici@example.cz",
      passwordHash: hash,
      firstName: "Marek",
      lastName: "Čekající",
      status: "PENDING",
    },
  });
  console.log("Seed dokončen. Lokální správce:", admin.email);
}
main().finally(() => db.$disconnect());
