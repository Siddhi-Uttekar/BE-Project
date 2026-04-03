const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');
    process.exit(0);
  } catch (error) {
    console.log('✗ Database connection failed');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
