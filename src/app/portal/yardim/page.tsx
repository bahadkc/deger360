'use client';

import { PortalLayout } from '@/components/portal/portal-layout';
import { Card } from '@/components/ui/card';
import { HelpCircle, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Süreç ne kadar sürer?',
    answer:
      'Süreç genellikle 4-6 ay arasında tamamlanır. Sigorta şirketinin cevap süresi ve müzakere sürecine bağlı olarak bu süre değişebilir. Çok sık yaşanan bir durum olmasa da 12 aya kadar uzayabilir.',
  },
  {
    id: '2',
    question: 'Hangi belgeleri yüklemeliyim?',
    answer:
      'Yüklemeniz gereken belgeler Belgeler sayfasında gösterilmektedir. Bu belgeler Değer360 ekibi tarafından sizden arayarak veya WhatsApp yoluyla talep edilecektir. Belgeler sisteme ekibimiz tarafından eklenecektir.',
  },
  {
    id: '3',
    question: 'Avukatımla nasıl iletişime geçerim?',
    answer:
      'WhatsApp numarasına yazdığınızda oradan iletişime geçilecek ve size yönlendirme yapılacaktır.',
  },
  {
    id: '4',
    question: 'Ödeme ne zaman yapılır?',
    answer:
      'Ödeme, sigorta şirketinden veya mahkemeden gelen karar sonrası yapılır. Genellikle kararın kesinleşmesinden sonra 1-2 hafta içinde ödeme gerçekleşir.',
  },
  {
    id: '5',
    question: 'Komisyon ücreti ne kadar?',
    answer:
      'Komisyon ücretimiz tazminat tutarının %15\'idir. Bu ücret, tazminat alındıktan sonra kesilir. Sizden hiçbir ön ödeme talep edilmez.',
  },
  {
    id: '6',
    question: 'Dosyamın durumunu nasıl takip edebilirim?',
    answer:
      'Dosya durumunu Dashboard\'daki Süreç Takibi kısmından takip edip inceleyebilirsiniz.',
  },
];

export default function YardimPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<Set<string>>(new Set());

  const toggleFAQ = (id: string) => {
    const newExpanded = new Set(expandedFAQ);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFAQ(newExpanded);
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Yardım & SSS</h1>
          <p className="text-neutral-600">Sıkça sorulan sorular ve iletişim bilgileri</p>
        </div>

        {/* Popular Questions */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-primary-blue" />
            <h2 className="text-xl font-bold text-neutral-800">Popüler Sorular</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => {
              const isExpanded = expandedFAQ.has(item.id);
              return (
                <div
                  key={item.id}
                  className="border border-neutral-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-800">{item.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-neutral-200 bg-neutral-50">
                      <p className="text-neutral-700 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">WhatsApp</h3>
            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-blue hover:text-primary-orange transition-colors"
            >
              0555 123 45 67
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">E-Posta</h3>
            <a
              href="mailto:destek@degerkaybim.com"
              className="text-primary-blue hover:text-primary-orange transition-colors"
            >
              destek@degerkaybim.com
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Telefon</h3>
            <a
              href="tel:+905551234567"
              className="text-primary-blue hover:text-primary-orange transition-colors"
            >
              0555 123 45 67
            </a>
          </Card>
        </div>

      </div>
    </PortalLayout>
  );
}
