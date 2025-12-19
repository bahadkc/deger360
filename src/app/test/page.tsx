export default function TestPage() {
  return (
    <div style={{ padding: '50px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#0077B6', fontSize: '48px', marginBottom: '20px' }}>
        ✅ Test Sayfası Çalışıyor!
      </h1>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px' }}>
        <p style={{ fontSize: '24px', marginBottom: '10px' }}>
          Next.js: ✅ Çalışıyor
        </p>
        <p style={{ fontSize: '24px', marginBottom: '10px' }}>
          React: ✅ Çalışıyor
        </p>
        <p style={{ fontSize: '24px', marginBottom: '10px' }}>
          Render: ✅ Çalışıyor
        </p>
      </div>
      <div style={{ marginTop: '30px', backgroundColor: '#FF6B35', color: 'white', padding: '20px', borderRadius: '10px' }}>
        <p style={{ fontSize: '20px' }}>
          Eğer bu sayfayı görüyorsanız, temel sistem çalışıyor demektir.
        </p>
        <p style={{ fontSize: '16px', marginTop: '10px' }}>
          Sorun muhtemelen Tailwind CSS veya Supabase ile ilgili.
        </p>
      </div>
    </div>
  );
}
