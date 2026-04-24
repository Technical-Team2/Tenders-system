const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  try {
    console.log('Setting up user_profiles table...');
    
    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, '003_user_profiles.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      // Try individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', { 
            sql_query: statement.trim() + ';' 
          });
          if (stmtError) {
            console.error('Error in statement:', stmtError);
            console.error('Statement:', statement.trim());
          } else {
            console.log('✓ Executed statement successfully');
          }
        }
      }
    } else {
      console.log('✓ User profiles table created successfully');
    }
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupDatabase();
