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
    key: 'ruhsat_fotokopisi',
    name: 'Ruhsat Fotokopisi',
    category: 'expected',
    description: 'Araç ruhsatının fotokopisi',
    required: true,
  },
  {
    key: 'kimlik_fotokopisi',
    name: 'Kimlik Fotokopisi',
    category: 'expected',
    description: 'Araç sahibinin kimlik fotokopisi',
    required: true,
  },
  {
    key: 'tamir_faturasi',
    name: 'Tamir Faturası',
    category: 'expected',
    description: 'Araç tamiri için alınan fatura',
    required: true,
  },
  {
    key: 'ekspertiz_raporu',
    name: 'Ekspertiz Raporu',
    category: 'prepared',
    description: 'Bağımsız eksper tarafından hazırlanan değer kaybı raporu',
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
