import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: {
      username: 'admin',
    },
    update: {
      email: 'admin@book.local',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      username: 'admin',
      email: 'admin@book.local',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin user is ready.');
  console.log(admin);
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
