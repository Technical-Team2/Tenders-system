export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Test</h1>
      <div>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl || 'NOT FOUND'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseAnonKey ? 'EXISTS' : 'NOT FOUND'}</p>
        <p><strong>NEXT_PUBLIC_APP_URL:</strong> {appUrl || 'NOT FOUND'}</p>
        <p><strong>SUPABASE_SERVICE_ROLE_KEY:</strong> {serviceRoleKey ? 'EXISTS' : 'NOT FOUND'}</p>
      </div>
    </div>
  );
}
