// Server Component - SEO dostu, içerik sunucuda render edilir
import { AlertCircle, Shield, FileCheck, ArrowRight } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

export function WhatIsSection() {
  return (
    <section id="nedir" className="py-12 sm:py-16 md:py-20 bg-white">
      <ScrollAnimation>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
                Değer Kaybı Nedir?
              </h2>
              <p className="text-base sm:text-lg text-neutral-800 px-2">
                Kaza sonrası aracınızın piyasa değeri düşer. Bu farkı tazminat olarak alabilirsiniz.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-red-100 to-orange-100 p-6 rounded-xl flex-1 relative overflow-hidden border-2 border-red-300 flex flex-col h-full">
                <div className="absolute top-0 right-0 text-8xl opacity-10 leading-none">⚠️</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-blue mb-2">
                    Sorun
                  </h3>
                  <p className="text-neutral-800">
                    Kaza geçirdiniz, aracınız tamir edildi ama artık eskisi kadar değerli değil.
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 text-primary-orange self-center">
                <ArrowRight className="w-8 h-8 md:w-12 md:h-12 rotate-90 md:rotate-0" />
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-xl flex-1 relative overflow-hidden border-2 border-blue-400 flex flex-col h-full">
                <div className="absolute top-0 right-0 text-8xl opacity-10 leading-none">💡</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-blue mb-2">
                    Çözüm
                  </h3>
                  <p className="text-neutral-800">
                    Değer kaybı tazminatı ile bu farkı karşı tarafın sigortasından alabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 text-primary-orange self-center">
                <ArrowRight className="w-8 h-8 md:w-12 md:h-12 rotate-90 md:rotate-0" />
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl flex-1 relative overflow-hidden border-2 border-green-400 flex flex-col h-full">
                <div className="absolute top-0 right-0 text-8xl opacity-10 leading-none">✅</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <FileCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-blue mb-2">
                    Süreç
                  </h3>
                  <p className="text-neutral-800">
                    Bütün süreç Değer360 ekibi tarafından titizlikle yönetilir, size hiçbir zahmet bırakmaz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}
