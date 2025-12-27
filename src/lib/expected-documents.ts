// Süreç boyunca yüklenecek beklenen belgeler listesi

export interface ExpectedDocument {
  key: string;
  name: string;
  category: string;
  description: string;
  required: boolean;
}

export const EXPECTED_DOCUMENTS: ExpectedDocument[] = [
  {
    key: 'kaza_tespit_tutanagi',
    name: 'Kaza Tespit Tutanağı',
    category: 'official',
    description: 'Kaza sonrası düzenlenen resmi tutanak',
    required: true,
  },
  {
    key: 'arac_fotograflari',
    name: 'Araç Fotoğrafları',
    category: 'expected',
    description: 'Kaza sonrası çekilen araç hasar fotoğrafları',
    required: true,
  },
  {
    key: 'bilir_kisi_raporu',
    name: 'Bilir Kişi Raporu',
    category: 'prepared',
    description: 'Bağımsız bilir kişi tarafından hazırlanan değer kaybı raporu',
    required: true,
  },
  {
    key: 'ruhsat',
    name: 'Ruhsat',
    category: 'expected',
    description: 'Araç ruhsatı',
    required: true,
  },
  {
    key: 'kimlik',
    name: 'Kimlik',
    category: 'expected',
    description: 'Araç sahibinin kimliği',
    required: true,
  },
  {
    key: 'sigortaya_gonderilen_ihtarname',
    name: 'Sigortaya Gönderilen İhtarname',
    category: 'legal',
    description: 'Sigorta şirketine gönderilen resmi ihtarname',
    required: true,
  },
  {
    key: 'hakem_karari',
    name: 'Hakem Kararı',
    category: 'legal',
    description: 'Hakem tarafından verilen karar belgesi',
    required: true,
  },
  {
    key: 'sigorta_odeme_dekontu',
    name: 'Sigorta Ödeme Dekontu',
    category: 'payment',
    description: 'Sigorta şirketinden alınan ödeme dekontu',
    required: true,
  },
];

// Belge key'inden isim bulma helper
export function getDocumentName(key: string): string {
  const doc = EXPECTED_DOCUMENTS.find((d) => d.key === key);
  return doc?.name || key;
}

// Belge key'inden kategori bulma helper
export function getDocumentCategory(key: string): string {
  const doc = EXPECTED_DOCUMENTS.find((d) => d.key === key);
  return doc?.category || 'other';
}
