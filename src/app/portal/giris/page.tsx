'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { loginWithCaseNumber } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';

const loginSchema = z.object({
  dosyaTakipNumarasi: z
    .string()
    .min(6, 'Dosya takip numarası 6 haneli olmalıdır')
    .max(6, 'Dosya takip numarası 6 haneli olmalıdır')
    .regex(/^\d{6}$/, 'Lütfen geçerli bir 6 haneli numara girin'),
  sifre: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  beniHatirla: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function GirisPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalImageUrl, setPortalImageUrl] = useState<string>('/images/portal_giris.png'); // Fallback

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Supabase'den portal giriş image'ını yükle
  useEffect(() => {
    const loadPortalImage = async () => {
      try {
        const { data } = supabase.storage
          .from('public-images')
          .getPublicUrl('portal_giris.png');
        
        if (data?.publicUrl) {
          setPortalImageUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('Error loading portal image from Supabase:', error);
        // Fallback to local image if Supabase fails
      }
    };

    loadPortalImage();
  }, []);

  // Login sayfasında normal header/footer ve sticky CTA'yı gizle
  useEffect(() => {
    const header = document.querySelector('body > header');
    const footer = document.querySelector('body > footer');
    const stickyCTA = document.querySelector('[class*="fixed"][class*="bottom-0"]');

    if (header) (header as HTMLElement).style.display = 'none';
    if (footer) (footer as HTMLElement).style.display = 'none';
    if (stickyCTA) (stickyCTA as HTMLElement).style.display = 'none';

    // Cleanup
    return () => {
      if (header) (header as HTMLElement).style.display = '';
      if (footer) (footer as HTMLElement).style.display = '';
      if (stickyCTA) (stickyCTA as HTMLElement).style.display = '';
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Supabase ile giriş yap
      await loginWithCaseNumber(data.dosyaTakipNumarasi, data.sifre);

      // Başarılı giriş sonrası portala yönlendir
      if (data.beniHatirla) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('caseNumber', data.dosyaTakipNumarasi);
      }
      
      // Clear any cached data before redirect
      window.location.href = '/portal';
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Hata mesajını kullanıcı dostu hale getir
      if (error.message?.includes('Dosya takip numarası bulunamadı')) {
        setError('Dosya takip numarası bulunamadı. Lütfen 6 haneli numaranızı kontrol edin.');
      } else if (error.message?.includes('Şifre hatalı')) {
        setError('Şifre hatalı. Lütfen tekrar deneyin.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Hesabınız doğrulanmamış. Lütfen email kutunuzu kontrol edin.');
      } else if (error.message?.includes('API anahtarı') || error.message?.includes('API key')) {
        setError('Sistem hatası: API anahtarı bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
      } else {
        setError(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue via-dark-blue to-primary-blue flex items-center justify-center p-4" data-portal-page>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Car Illustration */}
          <div className="bg-gradient-to-br from-primary-orange/10 to-primary-blue/10 p-12 flex items-center justify-center relative overflow-hidden hidden lg:flex">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-3xl"></div>
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 text-center"
            >
              {/* Portal Giriş İllüstrasyonu */}
              <div className="mb-8">
                <Image
                  src={portalImageUrl}
                  alt="Değer360 Müşteri Portalı Giriş Ekranı - Araç Değer Kaybı Tazminatı Takip Sistemi"
                  width={600}
                  height={450}
                  className="mx-auto w-full max-w-[600px] h-auto"
                  priority
                  unoptimized={portalImageUrl.startsWith('http')} // Supabase URL'leri için unoptimized
                />
              </div>
              
              <h2 className="text-3xl font-bold text-dark-blue mb-4">
                Dosyanızı Takip Edin
              </h2>
              <p className="text-lg text-neutral-700 max-w-md mx-auto">
                Araç değer kaybı sürecinizin her aşamasını kolayca takip edin ve avukatınızla iletişime geçin.
              </p>
            </motion.div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Logo */}
              <div className="mb-8 flex justify-center lg:justify-start">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/logo.png"
                    alt="Değer360 Logo"
                    width={150}
                    height={50}
                    className="h-10 w-auto"
                    priority
                  />
                </Link>
              </div>

              {/* Form Title */}
              <h1 className="text-3xl font-bold text-dark-blue mb-2">Hoş Geldiniz</h1>
              <p className="text-neutral-600 mb-8">6 haneli dosya takip numaranız ve şifrenizle giriş yapın</p>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Dosya Takip Numarası */}
                <div>
                  <label
                    htmlFor="dosyaTakipNumarasi"
                    className="block text-sm font-semibold text-neutral-800 mb-2"
                  >
                    Dosya Takip Numarası *
                  </label>
                  <input
                    {...register('dosyaTakipNumarasi')}
                    type="text"
                    id="dosyaTakipNumarasi"
                    placeholder="Örn: 100001"
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all duration-200 text-base ${
                      errors.dosyaTakipNumarasi ? 'bg-red-50 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.dosyaTakipNumarasi && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.dosyaTakipNumarasi.message}
                    </p>
                  )}
                </div>

                {/* Şifre */}
                <div>
                  <label
                    htmlFor="sifre"
                    className="block text-sm font-semibold text-neutral-800 mb-2"
                  >
                    Şifre *
                  </label>
                  <div className="relative">
                    <input
                      {...register('sifre')}
                      type={showPassword ? 'text' : 'password'}
                      id="sifre"
                      placeholder="Şifrenizi girin"
                      className={`w-full px-4 py-3 pr-12 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all duration-200 text-base ${
                        errors.sifre ? 'bg-red-50 focus:ring-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-primary-orange transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.sifre && (
                    <p className="mt-1 text-sm text-red-500">{errors.sifre.message}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    {...register('beniHatirla')}
                    type="checkbox"
                    id="beniHatirla"
                    className="w-5 h-5 text-primary-orange rounded focus:ring-primary-orange cursor-pointer"
                  />
                  <label
                    htmlFor="beniHatirla"
                    className="text-sm text-neutral-700 cursor-pointer"
                  >
                    Beni hatırla
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Giriş yapılıyor...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      GİRİŞ YAP
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <a
                    href="https://wa.me/905057053305?text=Benim%20adım%3A%20%2C%20telefon%20numaram%3A%20%2C%20aracımın%20plakası%3A%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-blue hover:text-primary-orange transition-colors font-medium inline-block"
                  >
                    Şifremi Unuttum
                  </a>
                </div>
              </form>

              {/* Back to Home */}
              <div className="mt-8 text-center">
                <Link
                  href="/"
                  className="text-sm text-neutral-600 hover:text-primary-orange transition-colors"
                >
                  ← Ana sayfaya dön
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
