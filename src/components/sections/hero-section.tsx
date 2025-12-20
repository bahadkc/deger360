'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calculator, ArrowRight, Info } from 'lucide-react';

const heroFormSchema = z.object({
  aracMarkaModel: z.string()
    .min(2, "Lütfen araç marka/model girin"),
  hasarTutari: z.coerce.number()
    .min(1000, "Minimum 1.000 TL olmalıdır")
    .max(500000, "Maksimum 500.000 TL olabilir"),
});

type HeroFormData = z.infer<typeof heroFormSchema>;

export function HeroSection() {
  const [isCalculating, setIsCalculating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<HeroFormData>({
    resolver: zodResolver(heroFormSchema)
  });

  const onSubmit = (data: HeroFormData) => {
    setIsCalculating(true);
    // Save form data to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('heroFormData', JSON.stringify(data));
    }
    // Redirect to teklif page
    setTimeout(() => {
      window.location.href = '/teklif';
    }, 500);
  };

  return (
    <section id="contact-form" className="relative min-h-screen bg-white pt-12 pb-8 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-dark-blue mb-4 leading-tight">
              Değer Kaybınızı{' '}
              <span className="text-primary-orange">Hesaplayın</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-800 max-w-2xl mx-auto">
              Kaza sonrası aracınızın değer kaybını öğrenin ve tazminat hakkınızı kolayca hesaplayın. Ücretsiz, hızlı ve güvenli.
            </p>
          </motion.div>

          {/* Hero Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 md:p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Araç Marka/Model */}
                <div className="flex flex-col">
                  <label htmlFor="hero-aracMarkaModel" className="block text-sm font-semibold text-neutral-800 mb-2">
                    Araç Marka/Model *
                  </label>
                  <input
                    {...register('aracMarkaModel')}
                    type="text"
                    id="hero-aracMarkaModel"
                    placeholder="Örn: Renault Megane"
                    className={`w-full px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all duration-200 text-base h-[52px] ${
                      errors.aracMarkaModel ? 'bg-red-50 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.aracMarkaModel && (
                    <p className="mt-1 text-sm text-red-500">{errors.aracMarkaModel.message}</p>
                  )}
                </div>

                {/* Hasar Tutarı */}
                <div className="flex flex-col">
                  <label htmlFor="hero-hasarTutari" className="block text-sm font-semibold text-neutral-800 mb-2">
                    <span className="flex items-center gap-2">
                      Hasar (TRAMER) Tutarı *
                      <div className="relative group">
                        <button
                          type="button"
                          className="text-primary-blue hover:text-primary-orange transition-colors focus:outline-none"
                          aria-label="TRAMER tutarı hakkında bilgi"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-dark-blue text-white text-xs rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <p className="mb-1 font-semibold">TRAMER Tutarı Nasıl Öğrenilir?</p>
                          <p className="mb-1">5664'e SMS gönderip öğrenebilirsiniz.</p>
                          <p>TRAMER tutarını bilmiyorsanız tahmini yazabilirsiniz.</p>
                          <div className="absolute left-4 bottom-0 translate-y-1/2 rotate-45 w-2 h-2 bg-dark-blue"></div>
                        </div>
                      </div>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('hasarTutari')}
                      type="number"
                      id="hero-hasarTutari"
                      placeholder="15000"
                      className={`w-full pl-12 pr-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all duration-200 text-base h-[52px] ${
                        errors.hasarTutari ? 'bg-red-50 focus:ring-red-500' : ''
                      }`}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 font-semibold">
                      TL
                    </span>
                  </div>
                  {errors.hasarTutari && (
                    <p className="mt-1 text-sm text-red-500">{errors.hasarTutari.message}</p>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
              >
                {isCalculating ? (
                  'Hesaplanıyor...'
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Ücretsiz Değer Kaybı Hesapla
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Trust Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-sm text-neutral-600 mt-5"
          >
            Ücretsiz • Hızlı • Güvenli
          </motion.p>
        </div>
      </div>
    </section>
  );
}
