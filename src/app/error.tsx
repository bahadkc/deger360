'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white border-2 border-red-200 rounded-lg p-8 shadow-lg">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Bir Şeyler Ters Gitti</h2>
          <p className="text-gray-600 mb-6">
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          {error.message && (
            <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 p-3 rounded">
              {error.message}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="bg-primary-orange hover:bg-primary-orange-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Ana Sayfa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

