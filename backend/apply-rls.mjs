import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  
  const tables = [
    'users', 'organizations', 'organization_members', 'creators', 
    'creator_social_accounts', 'platforms', 'creator_categories', 
    'creator_languages', 'creator_locations', 'creator_rates', 
    'creator_portfolio', 'campaigns', 'campaign_platforms', 
    'campaign_requirements', 'applications', 'files', 
    'deliverables', 'payments', 'provider_events', 
    'campaign_activity', 'creator_stats', 'social_metric_snapshot', 
    'creator_score', 'scrape_job', 'audit_logs'
  ];

  console.log('Enabling Row Level Security (RLS) on all tables...');
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`- RLS enabled for ${table}`);
      
      // Add a default policy to allow service roles (like Prisma backend) to bypass RLS
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'service_role_all'
            ) THEN
                CREATE POLICY "service_role_all" ON "${table}" 
                AS PERMISSIVE FOR ALL 
                TO service_role 
                USING (true) 
                WITH CHECK (true);
            END IF;
        END
        $$;
      `);
      console.log(`  - Default service_role policy added for ${table}`);

    } catch (error) {
      console.error(`Failed to enable RLS for ${table}:`, error.message);
    }
  }

  console.log('RLS setup completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
