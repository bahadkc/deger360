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
    taskKeys: ['ilk_gorusme_yapildi', 'musteri_arac_bilgileri'],
  },
  {
    id: 2,
    title: 'Evrak Toplama ve Bilir Kişi',
    emoji: '📋',
    boardStage: 'evrak_ekspertiz',
    taskKeys: ['kaza_tespit_tutanagi', 'arac_fotograflari', 'ruhsat_fotokopisi', 'kimlik_fotokopisi', 'arac_incelendi', 'deger_kaybi_hesaplandi', 'bilir_kisi_raporu_alindi'],
  },
  {
    id: 3,
    title: 'Sigorta Başvurusu',
    emoji: '📮',
    boardStage: 'sigorta_basvurusu',
    taskKeys: ['evraklar_talep_edildi', 'sigorta_basvurusu_yapildi', 'basvuru_inceleme_basladi'],
  },
  {
    id: 4,
    title: 'Müzakere',
    emoji: '🤝',
    boardStage: 'muzakere',
    taskKeys: ['sigorta_kabul_cevabi', 'odeme_bekleniyor'],
  },
  {
    id: 5,
    title: 'Ödeme',
    emoji: '💰',
    boardStage: 'odeme',
    taskKeys: ['musteriye_odeme_yapildi', 'musteri_bilgilendirildi'],
  },
  {
    id: 6,
    title: 'Tamamlandı',
    emoji: '✅',
    boardStage: 'tamamlandi',
    taskKeys: ['dava_tamamlandi'],
  },
];

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Başvuru Alındı
  { key: 'ilk_gorusme_yapildi', title: 'İlk görüşme yapıldı' },
  { key: 'musteri_arac_bilgileri', title: 'Müşteri ve araç bilgileri toplandı' },
  
  // Evrak Toplama
  { key: 'kaza_tespit_tutanagi', title: 'Kaza tespit tutanağı alındı' },
  { key: 'arac_fotograflari', title: 'Araç fotoğrafları alındı' },
  { key: 'ruhsat_fotokopisi', title: 'Ruhsat fotokopisi alındı' },
  { key: 'kimlik_fotokopisi', title: 'Kimlik fotokopisi alındı' },
  
  // Bilir Kişi Raporu
  { key: 'arac_incelendi', title: 'Araç İncelendi' },
  { key: 'deger_kaybi_hesaplandi', title: 'Değer Kaybı Hesaplandı' },
  { key: 'bilir_kisi_raporu_alindi', title: 'Bilir Kişi Raporu alındı' },
  
  // Sigorta Başvurusu
  { key: 'evraklar_talep_edildi', title: 'Evraklar talep edildi' },
  { key: 'sigorta_basvurusu_yapildi', title: 'Karşı tarafın sigortasına başvuru yapıldı' },
  { key: 'basvuru_inceleme_basladi', title: 'Başvuru alındı, inceleme başladı' },
  
  // Müzakere
  { key: 'sigorta_kabul_cevabi', title: 'Sigortadan kabul cevabı geldi' },
  { key: 'odeme_bekleniyor', title: 'Ödeme bekleniyor' },
  
  // Ödeme
  { key: 'musteriye_odeme_yapildi', title: 'Müşteriye ödeme yapıldı' },
  { key: 'musteri_bilgilendirildi', title: 'Müşteri bilgilendirildi' },
  
  // Tamamlandı
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

// Tüm checklist item'ları tamamlanmış mı kontrol et
export function isAllChecklistCompleted(
  checklistItems: Array<{ task_key: string; completed: boolean }>
): boolean {
  // Tüm CHECKLIST_ITEMS'ın completed olup olmadığını kontrol et
  const allTaskKeys = CHECKLIST_ITEMS.map((item) => item.key);
  const completedTaskKeys = checklistItems
    .filter((item) => item.completed)
    .map((item) => item.task_key);
  
  // Tüm task key'ler completed olmalı
  return allTaskKeys.every((key) => completedTaskKeys.includes(key));
}

// Bir case'in tamamlanmış olup olmadığını kontrol et
// Tamamlanmış = board_stage === 'tamamlandi' VEYA tüm checklist tamamlanmış
export function isCaseCompleted(
  boardStage: string | null,
  checklistItems: Array<{ task_key: string; completed: boolean }>
): boolean {
  // Eğer board_stage 'tamamlandi' ise tamamlanmış
  if (boardStage === 'tamamlandi') {
    return true;
  }
  
  // Veya tüm checklist tamamlanmışsa tamamlanmış
  return isAllChecklistCompleted(checklistItems);
}
