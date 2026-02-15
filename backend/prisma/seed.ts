import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@riseuppreps.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.info('Admin user already exists. Skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.info(`Admin user created: ${adminEmail}`);
  console.info('Database seeding complete.');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
