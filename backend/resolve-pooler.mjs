import dns from 'dns/promises';

const regions = [
  'eu-central-1',
  'us-east-1',
  'us-west-1',
  'us-east-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1'
];

async function check() {
  console.log('Testing Supabase direct DNS:');
  try {
    const direct = await dns.lookup('db.kjensdjuxsgqlntasexf.supabase.co');
    console.log('Direct lookup:', direct);
  } catch (err) {
    console.log('Direct lookup failed (likely IPv6-only):', err.message);
  }

  console.log('\nTesting Supabase Pooler domains:');
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    try {
      const res = await dns.lookup(host);
      console.log(`✓ Pooler found for ${reg}: ${host} -> ${res.address}`);
    } catch {}
  }
}

check();
