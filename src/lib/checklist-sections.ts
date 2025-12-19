// Paylaşılan checklist section ve item tanımları
// Hem admin panel hem de müşteri portalında kullanılır

export interface ChecklistSection {
  id: number;
  title: string;
  emoji: string;
  boardStage: string;
  taskKeys: string[];
}

export interface ChecklistItem {
  key: string;
  title: string;
}

// Section tanımları
export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 1,
    title: 'Başvuru Alındı',
    emoji: '📝',
    boardStage: 'basvuru_alindi',
    taskKeys: ['musteri_arac_bilgileri'],
  },
  {
    id: 2,
    title: 'İlk Görüşme',
    emoji: '👋',
    boardStage: 'ilk_gorusme',
    taskKeys: ['ilk_gorusme_yapildi'],
  },
  {
    id: 3,
    title: 'Evrak Toplama',
    emoji: '📋',
    boardStage: 'evrak_ekspertiz',
    taskKeys: ['kaza_tespit_tutanagi', 'arac_fotograflari', 'ruhsat_fotokopisi', 'kimlik_fotokopisi'],
  },
  {
    id: 4,
    title: 'Tamir ve Ekspertiz',
    emoji: '🔧',
    boardStage: 'evrak_ekspertiz',
    taskKeys: ['tamir_yapildi', 'tamir_faturasi', 'eksper_atandi', 'arac_incelendi', 'deger_kaybi_hesaplandi', 'ekspertiz_raporu'],
  },
  {
    id: 5,
    title: 'Sigorta Başvurusu',
    emoji: '📮',
    boardStage: 'sigorta_basvurusu',
    taskKeys: ['tum_belgeler_toplandi', 'dosya_hazirlandi', 'sigorta_basvurusu_yapildi', 'belgeler_gonderildi', 'basvuru_inceleme_basladi'],
  },
  {
    id: 6,
    title: 'Müzakere',
    emoji: '🤝',
    boardStage: 'muzakere',
    taskKeys: ['sigorta_kabul_cevabi', 'anlasma_sureci_basladi', 'sigorta_anlasildi', 'odeme_bekleniyor'],
  },
  {
    id: 7,
    title: 'Ödeme',
    emoji: '💰',
    boardStage: 'odeme',
    taskKeys: ['musteriye_odeme_yapildi', 'musteri_bilgilendirildi'],
  },
  {
    id: 8,
    title: 'Tamamlandı',
    emoji: '✅',
    boardStage: 'tamamlandi',
    taskKeys: ['dava_tamamlandi'],
  },
];

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'musteri_arac_bilgileri', title: 'Müşteri ve araç bilgileri toplandı' },
  { key: 'ilk_gorusme_yapildi', title: 'İlk görüşme yapıldı' },
  { key: 'kaza_tespit_tutanagi', title: 'Kaza tespit tutanağı alındı' },
  { key: 'arac_fotograflari', title: 'Araç fotoğrafları alındı' },
  { key: 'ruhsat_fotokopisi', title: 'Ruhsat fotokopisi alındı' },
  { key: 'kimlik_fotokopisi', title: 'Kimlik fotokopisi alındı' },
  { key: 'tamir_yapildi', title: 'Tamir yapıldı' },
  { key: 'tamir_faturasi', title: 'Tamir faturası alındı' },
  { key: 'eksper_atandi', title: 'Eksper atandı' },
  { key: 'arac_incelendi', title: 'Araç incelendi' },
  { key: 'deger_kaybi_hesaplandi', title: 'Değer kaybı hesaplandı' },
  { key: 'ekspertiz_raporu', title: 'Ekspertiz raporu alındı' },
  { key: 'tum_belgeler_toplandi', title: 'Tüm belgeler toplandı' },
  { key: 'dosya_hazirlandi', title: 'Dosya hazırlandı' },
  { key: 'sigorta_basvurusu_yapildi', title: 'Karşı tarafın sigortasına başvuru yapıldı' },
  { key: 'belgeler_gonderildi', title: 'Belgeler gönderildi' },
  { key: 'basvuru_inceleme_basladi', title: 'Başvuru alındı, inceleme başladı' },
  { key: 'sigorta_kabul_cevabi', title: 'Sigortadan kabul cevabı geldi' },
  { key: 'anlasma_sureci_basladi', title: 'Sigorta şirketi ile anlaşma süreci başladı' },
  { key: 'sigorta_anlasildi', title: 'Sigorta şirketi ile anlaşıldı' },
  { key: 'odeme_bekleniyor', title: 'Ödeme bekleniyor' },
  { key: 'musteriye_odeme_yapildi', title: 'Müşteriye ödeme yapıldı' },
  { key: 'musteri_bilgilendirildi', title: 'Müşteri bilgilendirildi' },
  { key: 'dava_tamamlandi', title: 'Dava tamamlandı' },
];

// Section tamamlandı mı kontrol et
export function isSectionCompleted(
  section: ChecklistSection,
  checklistItems: Array<{ task_key: string; completed: boolean }>
): boolean {
  const sectionItems = checklistItems.filter((item) => section.taskKeys.includes(item.task_key));
  return sectionItems.length > 0 && sectionItems.every((item) => item.completed);
}

// Mevcut section'ı belirle (tamamlanmamış ilk section)
export function getCurrentSection(
  checklistItems: Array<{ task_key: string; completed: boolean }>
): ChecklistSection | null {
  for (const section of CHECKLIST_SECTIONS) {
    if (!isSectionCompleted(section, checklistItems)) {
      return section;
    }
  }
  // Tüm sectionlar tamamlandıysa son section'ı döndür
  return CHECKLIST_SECTIONS[CHECKLIST_SECTIONS.length - 1];
}
