import { Client } from 'pg';

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

async function testRegions() {
  console.log('Testing Supabase poolers across regions with project credentials...\n');
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    const user = `postgres.${projectRef}`;
    
    // Test Session Mode on port 5432 (or 6543)
    for (const port of [5432, 6543]) {
      const client = new Client({
        host,
        port,
        user,
        password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000,
      });

      try {
        await client.connect();
        const res = await client.query('SELECT NOW() as current_time, version() as pg_version');
        console.log(`\n🎉 SUCCESS! Connected to region: ${reg} on port ${port}!`);
        console.log('PostgreSQL version:', res.rows[0].pg_version);
        console.log('Exact Connection String:');
        console.log(`postgresql://${user}:${password}@${host}:${port}/postgres?sslmode=require`);
        await client.end();
        return { region: reg, port, host, user };
      } catch (err) {
        // failed on this port/region, continue
      } finally {
        try { await client.end(); } catch {}
      }
    }
  }
  console.log('Could not connect to any tested pooler region.');
}

testRegions();
