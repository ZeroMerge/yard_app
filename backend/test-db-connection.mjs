import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('Testing Supabase PostgreSQL connection...');
  try {
    const res = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✓ Successfully connected to Supabase PostgreSQL!');
    console.log('Result:', res);
  } catch (err) {
    console.error('Connection failed with error:');
    console.error(err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
