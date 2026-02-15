import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { verifyEmailConnection } from './config/email';

async function main() {
  // Test database connection
  try {
    await prisma.$connect();
    console.info('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // Verify email connection
  await verifyEmailConnection();

  // Start server
  app.listen(env.PORT, () => {
    console.info(`Server running on port ${env.PORT}`);
    console.info(`Environment: ${env.NODE_ENV}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.info('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
