import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Türkçe karakterleri İngilizce karakterlere çevirir
 * Şifre oluşturma için kullanılır - sadece İngilizce karakter ve rakam kullanılmasını sağlar
 */
export function turkishToEnglish(text: string): string {
  const turkishChars: { [key: string]: string } = {
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ü': 'u', 'Ü': 'u',
    'ş': 's', 'Ş': 's',
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
  };

  return text
    .split('')
    .map(char => turkishChars[char] || char)
    .join('')
    .toLowerCase();
}

