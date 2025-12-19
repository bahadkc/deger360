'use client';

export function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 lg:hidden z-40 border-t-2 border-neutral-200">
      <button
        onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
        className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white font-bold py-3 rounded-lg shadow-lg"
      >
        Hemen Başvur
      </button>
    </div>
  );
}

