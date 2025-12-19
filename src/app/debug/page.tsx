export default function DebugPage() {
    return (
      <div style={{ padding: '50px', fontFamily: 'monospace' }}>
        <h1>🔍 Environment Variables Debug</h1>
        <pre style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          {JSON.stringify({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MISSING',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET (hidden)' : '❌ MISSING',
          }, null, 2)}
        </pre>
      </div>
    );
  }