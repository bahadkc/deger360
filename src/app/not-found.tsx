'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const quickFormSchema = z.object({
  isim: z.string()
    .min(2, "İsim en az 2 karakter olmalıdır"),
  telefon: z.string()
    .min(10, "Geçerli bir telefon numarası girin")
    .max(15, "Geçerli bir telefon numarası girin"),
  aracModel: z.string()
    .min(2, "Araç model bilgisi girin"),
  tramer: z.coerce.number()
    .min(1000, "Minimum 1.000 TL olmalıdır")
    .max(500000, "Maksimum 500.000 TL olabilir"),
});

type QuickFormData = z.infer<typeof quickFormSchema>;

export default function NotFound() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<QuickFormData>({
    resolver: zodResolver(quickFormSchema)
  });

  const onSubmit = async (data: QuickFormData) => {
    setIsLoading(true);
    try {
      // Form verilerini localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('quickFormData', JSON.stringify(data));
      }
      
      // API'ye gönder
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isim: data.isim,
          telefon: data.telefon,
          aracMarkaModel: data.aracModel,
          hasarTutari: data.tramer,
          email: 'bilgi-yok@deger360.net', // Zorunlu alan için placeholder
        }),
      });

      setIsSubmitted(true);
      
      // 2 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Form gönderimi sırasında hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-24 h-24 text-primary-orange" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-dark-blue mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-dark-blue mb-4">
              Sayfa Bulunamadı
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            </p>
          </motion.div>

          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-primary-blue hover:bg-dark-blue text-white font-bold px-6 py-3 rounded-lg transition-colors mb-12"
          >
            <Home className="w-5 h-5" />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Hızlı İletişim Formu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-dark-blue mb-2">
                  Buraya Kadar Geldiyseniz Bize Ulaşın!
                </h3>
                <p className="text-neutral-600">
                  Değer kaybınızı hesaplamak için formu doldurun, size en kısa sürede dönelim.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  {/* İsim */}
                  <div>
                    <label htmlFor="isim" className="block text-sm font-semibold text-neutral-800 mb-2">
                      İsim Soyisim *
                    </label>
                    <input
                      {...register('isim')}
                      type="text"
                      id="isim"
                      placeholder="Adınız Soyadınız"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all ${
                        errors.isim ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {errors.isim && (
                      <p className="mt-1 text-sm text-red-500">{errors.isim.message}</p>
                    )}
                  </div>

                  {/* Telefon */}
                  <div>
                    <label htmlFor="telefon" className="block text-sm font-semibold text-neutral-800 mb-2">
                      Telefon *
                    </label>
                    <input
                      {...register('telefon')}
                      type="tel"
                      id="telefon"
                      placeholder="05XX XXX XX XX"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all ${
                        errors.telefon ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {errors.telefon && (
                      <p className="mt-1 text-sm text-red-500">{errors.telefon.message}</p>
                    )}
                  </div>

                  {/* Araç Model */}
                  <div>
                    <label htmlFor="aracModel" className="block text-sm font-semibold text-neutral-800 mb-2">
                      Araç Marka/Model *
                    </label>
                    <input
                      {...register('aracModel')}
                      type="text"
                      id="aracModel"
                      placeholder="Örn: Renault Megane"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all ${
                        errors.aracModel ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {errors.aracModel && (
                      <p className="mt-1 text-sm text-red-500">{errors.aracModel.message}</p>
                    )}
                  </div>

                  {/* TRAMER */}
                  <div>
                    <label htmlFor="tramer" className="block text-sm font-semibold text-neutral-800 mb-2">
                      Hasar (TRAMER) Tutarı *
                    </label>
                    <div className="relative">
                      <input
                        {...register('tramer')}
                        type="number"
                        id="tramer"
                        placeholder="15000"
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all ${
                          errors.tramer ? 'border-red-500' : 'border-neutral-200'
                        }`}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 font-semibold">
                        TL
                      </span>
                    </div>
                    {errors.tramer && (
                      <p className="mt-1 text-sm text-red-500">{errors.tramer.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Gönderiliyor...' : 'Hemen Başvur'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-blue mb-2">Başvurunuz Alındı!</h3>
              <p className="text-neutral-600">En kısa sürede size dönüş yapacağız. Ana sayfaya yönlendiriliyorsunuz...</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

