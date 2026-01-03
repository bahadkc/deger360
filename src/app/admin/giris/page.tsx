'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAsAdmin } from '@/lib/supabase/admin-auth';
import { Lock, Mail } from 'lucide-react';
import { adminRoutes } from '@/lib/config/admin-paths';

export default function AdminGirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Normalize email (trim and lowercase)
      const normalizedEmail = email.trim().toLowerCase();
      
      if (!normalizedEmail || !password) {
        setError('Lütfen e-posta ve şifre alanlarını doldurun.');
        setLoading(false);
        return;
      }

      await loginAsAdmin(normalizedEmail, password);
      // Use router.push instead of window.location.href to preserve session
      // Small delay to ensure session is fully set
      await new Promise(resolve => setTimeout(resolve, 200));
      router.push(adminRoutes.dashboard);
    } catch (err: any) {
      console.error('Admin login error:', err);
      // More user-friendly error messages
      let errorMessage = err.message || 'Giriş başarısız. Lütfen tekrar deneyin.';
      
      if (err.message?.includes('Invalid login credentials') || 
          err.message?.includes('Invalid credentials') ||
          err.message?.includes('E-posta veya şifre hatalı')) {
        errorMessage = 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch - only render after mount
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-blue to-primary-orange p-4">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-blue to-primary-orange p-4" suppressHydrationWarning>
      <Card className="w-full max-w-md p-8" suppressHydrationWarning>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Admin Girişi</h1>
          <p className="text-neutral-600">Yönetim paneline erişmek için giriş yapın</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" suppressHydrationWarning>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
