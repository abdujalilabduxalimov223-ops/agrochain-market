import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRoleType } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL topilmadi');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const roles = [
    { name: UserRoleType.SUPER_ADMIN, description: 'Tizimning bosh administratori' },
    { name: UserRoleType.ADMIN, description: 'Oddiy administrator' },
    { name: UserRoleType.FARMER, description: 'Fermer foydalanuvchisi' },
    { name: UserRoleType.WAREHOUSE, description: 'Ombor operatori' },
    { name: UserRoleType.TRANSPORT, description: 'Transport operatori' },
    { name: UserRoleType.SELLER, description: 'Sotuvchi' },
    { name: UserRoleType.CUSTOMER, description: 'Xaridor' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  console.log('Rollar muvaffaqiyatli qo‘shildi');
}

main()
  .catch((e) => {
    console.error('Seed xatoligi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });