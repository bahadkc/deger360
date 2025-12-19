import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-light-blue/20 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-dark-blue mb-4">
          Başvurunuz Alındı!
        </h1>
        
        <p className="text-xl text-neutral-800 mb-8">
          Ekibimiz en geç <strong>2 saat içinde</strong> sizinle iletişime geçecektir.
          Lütfen telefonunuzu açık tutun.
        </p>
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="font-bold text-lg mb-4">Sırada Ne Var?</h2>
          <ul className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span>Uzman danışmanımız sizi arayacak</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span>Durumunuzu değerlendirecek</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span>Gerekli evrakları belirleyecek</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span>Süreci başlatacak</span>
            </li>
          </ul>
        </div>
        
        <Link
          href="/"
          className="inline-block bg-primary-blue hover:bg-dark-blue text-white font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

