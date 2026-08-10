import { PrismaClient } from '@prisma/client';

const regions = [
  'eu-central-1',
  'us-east-1',
  'eu-west-1',
  'us-west-1',
  'eu-west-2',
  'eu-west-3',
  'us-east-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1'
];

const password = 'hNex660QkuTmEjEp';
const projectRef = 'kjensdjuxsgqlntasexf';

async function testAll() {
  console.log('Testing Supabase poolers across regions via Prisma Client...\n');
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    const user = `postgres.${projectRef}`;
    
    // Test on port 5432 (Session Mode for schema push) and 6543
    for (const port of [5432, 6543]) {
      const url = `postgresql://${user}:${password}@${host}:${port}/postgres?sslmode=require&connect_timeout=4`;
      const prisma = new PrismaClient({
        datasources: {
          db: { url },
        },
      });

      try {
        const res = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
        console.log(`\n🎉 SUCCESS! Connected to Supabase Region: ${reg} on Port: ${port}!`);
        console.log('PostgreSQL version:', res);
        console.log('\nExact Connection String for .env:');
        console.log(`DATABASE_URL="${url}"`);
        await prisma.$disconnect();
        return;
      } catch (err) {
        // try next
      } finally {
        await prisma.$disconnect().catch(() => {});
      }
    }
  }
  console.log('Could not connect to any tested pooler region. Please check password or project region.');
}

testAll();
