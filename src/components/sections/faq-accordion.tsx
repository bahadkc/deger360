'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 sm:space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-neutral-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-100 transition-colors"
          >
            <span className="font-bold text-sm sm:text-base text-dark-blue pr-4">
              {faq.question}
            </span>
            {openIndex === index ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-orange flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary-orange flex-shrink-0" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-neutral-800">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
