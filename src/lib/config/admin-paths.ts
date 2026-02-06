/**
 * Admin panel path configuration
 * Gizli admin path - bot ve müşteriler tarafından bulunmaması için
 * Bu path'i düzenli olarak değiştirmeniz önerilir
 */

// Gizli admin panel path
// Bu path'i değiştirmek için tüm referansları güncellemeyi unutmayın
export const ADMIN_PATH = '/sys-admin-panel-secure-7x9k2m';

// Admin route helper functions
export const adminRoutes = {
  base: ADMIN_PATH,
  login: `${ADMIN_PATH}/giris`,
  dashboard: `${ADMIN_PATH}`,
  customers: `${ADMIN_PATH}/musteriler`,
  customerDetail: (id: string) => `${ADMIN_PATH}/musteriler/${id}`,
  documentsSummary: `${ADMIN_PATH}/dokuman-ozeti`,
  reports: `${ADMIN_PATH}/raporlar`,
  admins: `${ADMIN_PATH}/adminler`,
  adminDetail: (id: string) => `${ADMIN_PATH}/adminler/${id}`,
  createAdmin: `${ADMIN_PATH}/admin-olustur`,
};

/**
 * Check if path is admin path
 */
export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_PATH);
}

/**
 * Get admin path from relative path
 */
export function getAdminPath(relativePath: string): string {
  // Remove leading slash if exists
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${ADMIN_PATH}/${cleanPath}`;
}

