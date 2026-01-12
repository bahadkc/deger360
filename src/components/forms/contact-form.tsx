'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Send, Loader2, Shield, Clock, Lock } from 'lucide-react';

const formSchema = z.object({
  adSoyad: z.string()
    .min(3, "Lütfen ad ve soyadınızı girin")
    .max(50, "En fazla 50 karakter olabilir"),
  telefon: z.string()
    .regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir telefon numarası girin (5XX XXX XX XX)"),
  email: z.string()
    .email("Geçerli bir email adresi girin")
    .min(1, "E-posta adresi zorunludur"),
  aracMarkaModel: z.string()
    .min(2, "Lütfen araç marka/model seçin"),
  hasarTutari: z.coerce.number()
    .min(1000, "Minimum 1.000 TL olmalıdır")
    .max(500000, "Maksimum 500.000 TL olabilir"),
  kvkkOnay: z.boolean()
    .refine(val => val === true, "KVKK onayı zorunludur")
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  // Load hero form data if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const heroData = localStorage.getItem('heroFormData');
      if (heroData) {
        try {
          const data = JSON.parse(heroData);
          if (data.aracMarkaModel) setValue('aracMarkaModel', data.aracMarkaModel);
          if (data.hasarTutari) setValue('hasarTutari', data.hasarTutari);
          localStorage.removeItem('heroFormData');
        } catch (e) {
          console.error('Error loading hero form data:', e);
        }
      }
    }
  }, [setValue]);

  // Hero'dan gelen değerleri al (URL params veya localStorage'dan)
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = {
        adSoyad: data.adSoyad,
        telefon: data.telefon,
        email: data.email,
        aracMarkaModel: data.aracMarkaModel,
        hasarTutari: data.hasarTutari,
        kvkkOnay: data.kvkkOnay
      };

      const response = await fetch('/api/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('heroFormData');
          localStorage.removeItem('fromHeroForm');
        }
        
        setSubmitSuccess(true);
        
        // Analytics tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submission', {
            event_category: 'Lead',
            event_label: 'Contact Form'
          });
        }
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/tesekkurler';
        }, 2000);
      } else {
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
          Devam Edin, <span className="text-primary-orange">Başvurunuzu Tamamlayın</span>
        </h2>
        <p className="text-lg text-neutral-800 mb-4">
          Kalan bilgileri doldurun ve uzman ekibimiz sizinle iletişime geçsin.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-neutral-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Ad Soyad */}
          <div>
            <label htmlFor="adSoyad" className="block text-sm font-semibold text-neutral-800 mb-2">
              Ad Soyad *
            </label>
            <input
              {...register('adSoyad')}
              type="text"
              id="adSoyad"
              placeholder="Örn: Ahmet Yılmaz"
              autoComplete="name"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.adSoyad ? 'border-red-500' : 'border-neutral-300 focus:border-primary-orange'
              }`}
            />
            {errors.adSoyad && (
              <p className="mt-1 text-sm text-red-500">{errors.adSoyad.message}</p>
            )}
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="telefon" className="block text-sm font-semibold text-neutral-800 mb-2">
              Telefon Numarası *
            </label>
            <input
              {...register('telefon')}
              type="tel"
              id="telefon"
              placeholder="5XX XXX XX XX"
              autoComplete="tel"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.telefon ? 'border-red-500' : 'border-neutral-300 focus:border-primary-orange'
              }`}
            />
            {errors.telefon && (
              <p className="mt-1 text-sm text-red-500">{errors.telefon.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-neutral-800 mb-2">
              E-posta *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="ornek@email.com"
              autoComplete="email"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-primary-orange'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Araç Marka/Model */}
          <div>
            <label htmlFor="aracMarkaModel" className="block text-sm font-semibold text-neutral-800 mb-2">
              Araç Marka/Model *
            </label>
            <input
              {...register('aracMarkaModel')}
              type="text"
              id="aracMarkaModel"
              placeholder="Örn: Renault Megane, Volkswagen Golf"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.aracMarkaModel ? 'border-red-500' : 'border-neutral-300 focus:border-primary-orange'
              }`}
            />
            {errors.aracMarkaModel && (
              <p className="mt-1 text-sm text-red-500">{errors.aracMarkaModel.message}</p>
            )}
            <p className="mt-1 text-xs text-neutral-600">
              Araç marka ve modelini yazın (örn: Renault Megane)
            </p>
          </div>

          {/* Hasar Tutarı */}
          <div>
            <label htmlFor="hasarTutari" className="block text-sm font-semibold text-neutral-800 mb-2">
              Hasar (TRAMER) Tutarı *
              <span className="ml-2 text-xs font-normal text-neutral-600">
                (5664&apos;e SMS gönderip öğrenebilirsiniz)
              </span>
            </label>
            <div className="relative">
              <input
                {...register('hasarTutari')}
                type="number"
                id="hasarTutari"
                placeholder="15000"
                className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.hasarTutari ? 'border-red-500' : 'border-neutral-300 focus:border-primary-orange'
                }`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 font-semibold">
                TL
              </span>
            </div>
            {errors.hasarTutari && (
              <p className="mt-1 text-sm text-red-500">{errors.hasarTutari.message}</p>
            )}
            <p className="mt-1 text-xs text-neutral-600">
              TRAMER tutarını bilmiyorsanız tahmini yazabilirsiniz
            </p>
          </div>

          {/* KVKK Onayı */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('kvkkOnay')}
                type="checkbox"
                className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-orange focus:ring-primary-orange"
              />
              <span className="text-sm text-neutral-800">
                <a href="/kvkk" target="_blank" className="underline font-semibold text-primary-blue hover:text-dark-blue">
                  KVKK Aydınlatma Metni
                </a>&apos;ni okudum, onaylıyorum. *
              </span>
            </label>
            {errors.kvkkOnay && (
              <p className="mt-1 text-sm text-red-500">{errors.kvkkOnay.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Başvuruyu Tamamla
              </>
            )}
          </button>

          {/* Success Message */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg text-green-800 text-center font-semibold">
              ✅ Başvurunuz alındı! 2 saat içinde sizi arayacağız.
            </div>
          )}
        </form>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          SSL Şifreli Güvenli Form
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          KVKK Uyumlu
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          2 Saat İçinde Dönüş
        </div>
      </div>
    </div>
  );
}
