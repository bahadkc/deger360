'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, Home } from 'lucide-react';

// Form schemas
const personalInfoSchema = z.object({
  adSoyad: z.string()
    .min(3, "Lütfen ad ve soyadınızı girin")
    .max(50, "En fazla 50 karakter olabilir"),
  telefon: z.string()
    .regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir telefon numarası girin (5XX XXX XX XX)"),
  email: z.string()
    .email("Geçerli bir email adresi girin")
    .optional()
    .or(z.literal('')),
  kvkkOnay: z.boolean()
    .refine(val => val === true, "KVKK onayı zorunludur")
});

const vehicleInfoSchema = z.object({
  aracMarkaModel: z.string()
    .min(2, "Lütfen araç marka/model girin"),
  hasarTutari: z.coerce.number()
    .min(1000, "Minimum 1.000 TL olmalıdır")
    .max(500000, "Maksimum 500.000 TL olabilir"),
});

type PersonalInfoData = z.infer<typeof personalInfoSchema>;
type VehicleInfoData = z.infer<typeof vehicleInfoSchema>;

export default function TeklifPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleInfoData | null>(null);

  const personalForm = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema)
  });

  const vehicleForm = useForm<VehicleInfoData>({
    resolver: zodResolver(vehicleInfoSchema)
  });

  // Load vehicle data from localStorage on mount (only if exists and came from hero form)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromHeroForm = localStorage.getItem('fromHeroForm');
      const heroData = localStorage.getItem('heroFormData');
      
      // If there's data but no flag, it means user came directly (not from hero form)
      // Clear the old data
      if (heroData && !fromHeroForm) {
        localStorage.removeItem('heroFormData');
      }
      
      // Only use data if it came from hero form
      if (heroData && fromHeroForm === 'true') {
        try {
          const data = JSON.parse(heroData);
          if (data.aracMarkaModel && data.hasarTutari) {
            setVehicleData({
              aracMarkaModel: data.aracMarkaModel,
              hasarTutari: data.hasarTutari
            });
            // Pre-fill vehicle form only if data exists
            vehicleForm.setValue('aracMarkaModel', data.aracMarkaModel);
            vehicleForm.setValue('hasarTutari', data.hasarTutari);
          }
          // Remove the flag after using it
          localStorage.removeItem('fromHeroForm');
        } catch (e) {
          console.error('Error loading hero form data:', e);
          localStorage.removeItem('fromHeroForm');
        }
      }
      // If no heroData or no flag, vehicle form stays empty (default state)
    }
  }, [vehicleForm]);

  const onPersonalSubmit = (data: PersonalInfoData) => {
    setCurrentStep(2);
  };

  const onVehicleSubmit = async (data: VehicleInfoData) => {
    setIsSubmitting(true);
    
    try {
      const personalData = personalForm.getValues();
      const formData = {
        adSoyad: personalData.adSoyad,
        telefon: personalData.telefon,
        email: personalData.email || undefined, // Include email if provided
        aracMarkaModel: data.aracMarkaModel,
        hasarTutari: data.hasarTutari,
        kvkkOnay: personalData.kvkkOnay
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
        }
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Analytics tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submission', {
            event_category: 'Lead',
            event_label: 'Teklif Form'
          });
        }
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

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Sidebar - Progress Tracker */}
      <aside className="hidden lg:flex flex-col w-72 bg-neutral-50 border-r border-neutral-200 p-8">
        {/* Logo */}
        <div className="mb-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-orange">deger360</span>
            <span className="text-sm text-neutral-500">25™</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex-1">
          <div className="space-y-8">
            {/* Step 1: Kişisel Bilgiler */}
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  currentStep >= 1 ? 'bg-green-500' : 'bg-neutral-300'
                }`}>
                  {currentStep > 1 ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : currentStep === 1 ? (
                    <ChevronRight className="w-5 h-5 text-white" />
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`font-semibold text-base transition-colors ${
                  currentStep >= 1 ? 'text-green-600' : 'text-neutral-400'
                }`}>
                  Kişisel Bilgiler
                </span>
              </div>
            </div>

            {/* Step 2: Araç Bilgileri */}
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  currentStep >= 2 ? 'bg-blue-500' : 'bg-neutral-300'
                }`}>
                  {currentStep > 2 ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : currentStep === 2 ? (
                    <ChevronRight className="w-5 h-5 text-white" />
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`font-semibold text-base transition-colors ${
                  currentStep >= 2 ? 'text-blue-600' : 'text-neutral-400'
                }`}>
                  Araç Bilgileri
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-neutral-400 mt-auto">
          © deger360 2000-2025
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile Progress Tracker */}
        <div className="lg:hidden bg-white border-b border-neutral-200 p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary-orange">deger360</span>
              <span className="text-xs text-neutral-600">25™</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-green-500' : 'bg-neutral-300'
              }`}>
                {currentStep > 1 ? (
                  <Check className="w-4 h-4 text-white" />
                ) : currentStep === 1 ? (
                  <span className="text-xs text-white font-bold">1</span>
                ) : (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              <div className="w-8 h-0.5 bg-neutral-300" />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-500' : 'bg-neutral-300'
              }`}>
                {currentStep > 2 ? (
                  <Check className="w-4 h-4 text-white" />
                ) : currentStep === 2 ? (
                  <span className="text-xs text-white font-bold">2</span>
                ) : (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-xl">
            {currentStep === 1 && (
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-2 sm:mb-3">
                  Kişisel Bilgilerinizi Girin
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 mb-6 sm:mb-8">
                  Devam etmek için lütfen kişisel bilgilerinizi doldurun.
                </p>

                <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6">
                  {/* Ad Soyad */}
                  <div>
                    <label htmlFor="adSoyad" className="block text-sm font-semibold text-neutral-800 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      {...personalForm.register('adSoyad')}
                      type="text"
                      id="adSoyad"
                      placeholder="Örn: Ahmet Yılmaz"
                      autoComplete="name"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all ${
                        personalForm.formState.errors.adSoyad ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {personalForm.formState.errors.adSoyad && (
                      <p className="mt-1 text-sm text-red-500">
                        {personalForm.formState.errors.adSoyad.message}
                      </p>
                    )}
                  </div>

                  {/* Telefon */}
                  <div>
                    <label htmlFor="telefon" className="block text-sm font-semibold text-neutral-800 mb-2">
                      Telefon Numarası *
                    </label>
                    <input
                      {...personalForm.register('telefon')}
                      type="tel"
                      id="telefon"
                      placeholder="5XX XXX XX XX"
                      autoComplete="tel"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all ${
                        personalForm.formState.errors.telefon ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {personalForm.formState.errors.telefon && (
                      <p className="mt-1 text-sm text-red-500">
                        {personalForm.formState.errors.telefon.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-800 mb-2">
                      E-posta *
                    </label>
                    <input
                      {...personalForm.register('email')}
                      type="email"
                      id="email"
                      placeholder="ornek@email.com"
                      autoComplete="email"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all ${
                        personalForm.formState.errors.email ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {personalForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {personalForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* KVKK Onayı */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        {...personalForm.register('kvkkOnay')}
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-blue focus:ring-primary-blue"
                      />
                      <span className="text-sm text-neutral-800">
                        <a href="/kvkk" target="_blank" className="underline font-semibold text-primary-blue hover:text-primary-orange">
                          KVKK Aydınlatma Metni
                        </a>'ni okudum, onaylıyorum. *
                      </span>
                    </label>
                    {personalForm.formState.errors.kvkkOnay && (
                      <p className="mt-1 text-sm text-red-500">
                        {personalForm.formState.errors.kvkkOnay.message}
                      </p>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="text-primary-blue hover:text-primary-orange transition-colors flex items-center gap-2 text-base"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri
                    </button>
                    <button
                      type="submit"
                      className="bg-primary-blue hover:bg-primary-orange text-white font-semibold px-8 py-3 rounded-lg transition-colors text-base"
                    >
                      Devam
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-2 sm:mb-3">
                  {vehicleData ? 'Araç Bilgilerinizi Kontrol Edin' : 'Araç Bilgilerinizi Girin'}
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 mb-6 sm:mb-8">
                  {vehicleData 
                    ? 'Araç bilgileriniz otomatik olarak dolduruldu. Gerekirse düzenleyebilirsiniz.'
                    : 'Devam etmek için lütfen araç bilgilerinizi doldurun.'}
                </p>

                <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-6">
                  {/* Araç Marka/Model */}
                  <div>
                    <label htmlFor="aracMarkaModel" className="block text-sm font-semibold text-neutral-800 mb-2">
                      Araç Marka/Model *
                    </label>
                    <input
                      {...vehicleForm.register('aracMarkaModel')}
                      type="text"
                      id="aracMarkaModel"
                      placeholder="Örn: Toyota Corolla"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all ${
                        vehicleForm.formState.errors.aracMarkaModel ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {vehicleForm.formState.errors.aracMarkaModel && (
                      <p className="mt-1 text-sm text-red-500">
                        {vehicleForm.formState.errors.aracMarkaModel.message}
                      </p>
                    )}
                  </div>

                  {/* Hasar Tutarı */}
                  <div>
                    <label htmlFor="hasarTutari" className="block text-sm font-semibold text-neutral-800 mb-2">
                      Hasar (TRAMER) Tutarı *
                    </label>
                    <div className="relative">
                      <input
                        {...vehicleForm.register('hasarTutari')}
                        type="number"
                        id="hasarTutari"
                        placeholder="Örn: 50000"
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-all ${
                          vehicleForm.formState.errors.hasarTutari ? 'border-red-500' : 'border-neutral-200'
                        }`}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 font-semibold">
                        TL
                      </span>
                    </div>
                    {vehicleForm.formState.errors.hasarTutari && (
                      <p className="mt-1 text-sm text-red-500">
                        {vehicleForm.formState.errors.hasarTutari.message}
                      </p>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-primary-blue hover:text-primary-orange transition-colors flex items-center gap-2 text-base"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary-blue hover:bg-primary-orange text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {isSubmitting ? 'Gönderiliyor...' : 'Tamamla'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackToHome}>
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              Başvurunuz Alındı!
            </h2>
            <p className="text-base text-neutral-600 mb-6">
              Ekibimiz kısa süre içinde sizinle iletişime geçecek.
            </p>
            <button
              onClick={handleBackToHome}
              className="w-full bg-primary-blue hover:bg-primary-orange text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Anasayfaya Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
