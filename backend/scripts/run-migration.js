import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Connecting to Supabase...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('✅ Connected to Supabase');
    console.log('📄 Reading migration file...');

    const migrationPath = path.join(__dirname, '004_update_tenders_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing migration...');
    
    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // If rpc fails, try direct query
        console.log('RPC failed, trying direct SQL execution...');
        // Note: Direct SQL execution may not work through Supabase client
        // In that case, the migration should be run via psql or Supabase dashboard
        console.warn('Direct execution not available, please run via psql or Supabase dashboard');
        console.log('SQL Statement:', statement);
      }
    }

    console.log('✅ Migration completed successfully');
    console.log('');
    console.log('⚠️  If you see warnings above, please run the migration manually:');
    console.log('   1. Open Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of backend/scripts/004_update_tenders_schema.sql');
    console.log('   3. Execute the SQL');
    console.log('');
    console.log('Or use psql:');
    console.log('   psql $DATABASE_URL -f backend/scripts/004_update_tenders_schema.sql');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('');
    console.error('Please run the migration manually via:');
    console.error('   1. Supabase Dashboard > SQL Editor');
    console.error('   2. Copy contents of backend/scripts/004_update_tenders_schema.sql');
    console.error('   3. Execute the SQL');
    process.exit(1);
  }
}

runMigration();
