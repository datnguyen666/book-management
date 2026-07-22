import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ===== Admin =====
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: {
      username: 'admin',
    },
    update: {
      email: 'admin@book.local',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      username: 'admin',
      email: 'admin@book.local',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // ===== Staff =====
  const staffPassword = await bcrypt.hash('Staff@123', 10);

  const staff = await prisma.user.upsert({
    where: {
      username: 'staff',
    },
    update: {
      email: 'staff@book.local',
      password: staffPassword,
      role: Role.STAFF,
      isActive: true,
    },
    create: {
      username: 'staff',
      email: 'staff@book.local',
      password: staffPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  console.log('✅ Users are ready.');
  console.log(admin);
  console.log(staff);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
