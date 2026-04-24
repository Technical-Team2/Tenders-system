// Simple test script to verify authentication setup
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuth() {
  try {
    console.log('Testing authentication setup...');
    
    // Test 1: Check if user_profiles table exists
    console.log('\n1. Checking user_profiles table...');
    const { data: tables, error: tableError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ user_profiles table not found:', tableError.message);
      console.log('Please run the SQL script from README_DATABASE_SETUP.md');
      return;
    } else {
      console.log('✅ user_profiles table exists');
    }
    
    // Test 2: Check current user
    console.log('\n2. Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('ℹ️ No authenticated user (expected)');
    } else {
      console.log('✅ Authenticated user:', user.email);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.log('❌ User profile not found for authenticated user');
      } else {
        console.log('✅ User profile found:', profile);
      }
    }
    
    console.log('\n✅ Authentication setup test complete');
    console.log('\nNext steps:');
    console.log('1. Run the SQL script if user_profiles table doesn\'t exist');
    console.log('2. Test sign-up at http://localhost:3000/signup');
    console.log('3. Test sign-in at http://localhost:3000/signin');
    console.log('4. Check user_profiles table for new records');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();
