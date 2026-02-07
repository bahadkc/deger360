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
    title: 'Evrak Toplama ve Eksper',
    emoji: '📋',
    boardStage: 'evrak_ekspertiz',
    taskKeys: ['kaza_tespit_tutanagi', 'arac_fotograflari', 'ruhsat_fotokopisi', 'kimlik_fotokopisi', 'karsi_tarafin_ruhsati_alindi', 'karsi_tarafin_ehliyeti_alindi', 'eksper_raporu_alindi'],
  },
  {
    id: 3,
    title: 'Sigorta Başvurusu',
    emoji: '📮',
    boardStage: 'sigorta_basvurusu',
    taskKeys: ['sigorta_basvurusu_yapildi', 'sigortadan_kabul_cevabi_geldi', 'sigortadan_red_cevabi_geldi'],
  },
  {
    id: 4,
    title: 'Müzakere',
    emoji: '🤝',
    boardStage: 'muzakere',
    taskKeys: ['odeme_bekleniyor_muzakere', 'odeme_alindi_muzakere', 'sigortanin_yaptigi_odeme_dekontu_muzakere'],
  },
  {
    id: 7,
    title: 'Tahkim',
    emoji: '⚖️',
    boardStage: 'tahkim',
    taskKeys: ['tahkime_basvuru_yapildi', 'bilirkisi_rapor_hazirlandi', 'tahkim_sonucu_belirlendi', 'hakem_karari_dokumani_eklendi', 'odeme_bekleniyor_tahkim', 'odeme_alindi_tahkim', 'sigortanin_yaptigi_odeme_dekontu_tahkim'],
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
  { key: 'karsi_tarafin_ruhsati_alindi', title: 'Karşı tarafın ruhsatı alındı' },
  { key: 'karsi_tarafin_ehliyeti_alindi', title: 'Karşı tarafın ehliyeti alındı' },
  
  // Eksper Raporu
  { key: 'eksper_raporu_alindi', title: 'Eksper Raporu alındı' },
  
  // Sigorta Başvurusu
  { key: 'sigorta_basvurusu_yapildi', title: 'Karşı tarafın sigortasına başvuru yapıldı' },
  { key: 'sigortadan_kabul_cevabi_geldi', title: 'Sigortadan kabul cevabı geldi' },
  { key: 'sigortadan_red_cevabi_geldi', title: 'Sigortadan red cevabı geldi' },
  
  // Müzakere
  { key: 'odeme_bekleniyor_muzakere', title: 'Ödeme bekleniyor' },
  { key: 'odeme_alindi_muzakere', title: 'Ödeme alındı' },
  { key: 'sigortanin_yaptigi_odeme_dekontu_muzakere', title: 'Sigortanın yaptığı ödeme dekontu yüklendi' },
  
  // Tahkim
  { key: 'tahkime_basvuru_yapildi', title: 'Tahkime başvuru yapıldı' },
  { key: 'bilirkisi_rapor_hazirlandi', title: 'Bilirkişi rapor hazırlandı' },
  { key: 'tahkim_sonucu_belirlendi', title: 'Tahkim sonucu belirlendi' },
  { key: 'hakem_karari_dokumani_eklendi', title: 'Hakem kararı dökümanı eklendi' },
  { key: 'odeme_bekleniyor_tahkim', title: 'Ödeme bekleniyor' },
  { key: 'odeme_alindi_tahkim', title: 'Ödeme alındı' },
  { key: 'sigortanin_yaptigi_odeme_dekontu_tahkim', title: 'Sigortanın yaptığı ödeme dekontu yüklendi' },
  
  // Ödeme
  { key: 'musteriye_odeme_yapildi', title: 'Müşteriye ödeme yapıldı' },
  { key: 'musteri_bilgilendirildi', title: 'Müşteri bilgilendirildi' },
  
  // Tamamlandı
  { key: 'dava_tamamlandi', title: 'Başvuru tamamlandı' },
];

// Section tamamlandı mı kontrol et
export function isSectionCompleted(
  section: ChecklistSection,
  checklistItems: Array<{ task_key: string; completed: boolean }>
): boolean {
  // Special handling for Sigorta Başvurusu section
  // Section is completed if: sigorta_basvurusu_yapildi + (kabul OR red)
  if (section.boardStage === 'sigorta_basvurusu') {
    const basvuruYapildi = checklistItems.find(item => item.task_key === 'sigorta_basvurusu_yapildi')?.completed || false;
    const kabulCevabi = checklistItems.find(item => item.task_key === 'sigortadan_kabul_cevabi_geldi')?.completed || false;
    const redCevabi = checklistItems.find(item => item.task_key === 'sigortadan_red_cevabi_geldi')?.completed || false;
    return basvuruYapildi && (kabulCevabi || redCevabi);
  }
  
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
