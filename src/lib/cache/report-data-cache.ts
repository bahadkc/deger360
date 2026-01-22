/**
 * Report Data Cache
 * Prevents multiple API calls for the same report data
 */

interface CachedReportData {
  cases: any[];
  admins: any[];
  caseAdmins: any[];
  checklist: any[];
  documents: any[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const cache: Map<string, CachedReportData> = new Map();

/**
 * Get cached report data or fetch from API
 * @param role - User role (admin, lawyer, acente, superadmin)
 * @param period - Report period (for superadmin only)
 * @returns Cached or fresh report data
 */
export async function getReportData(
  role: string,
  period: string = 'all_time'
): Promise<CachedReportData> {
  const cacheKey = `${role}_${period}`;
  const cached = cache.get(cacheKey);

  // Check if cache is valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Report Cache] Using cached data for ${cacheKey}`);
    return cached;
  }

  // Fetch fresh data
  console.log(`[Report Cache] Fetching fresh data for ${cacheKey}`);
  const response = await fetch(`/api/get-report-data?role=${role}&period=${period}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load report data');
  }

  const data = await response.json();
  const reportData: CachedReportData = {
    cases: data.cases || [],
    admins: data.admins || [],
    caseAdmins: data.caseAdmins || [],
    checklist: data.checklist || [],
    documents: data.documents || [],
    timestamp: Date.now(),
  };

  // Update cache
  cache.set(cacheKey, reportData);
  console.log(`[Report Cache] Cached data for ${cacheKey}`);

  return reportData;
}

/**
 * Clear cache for a specific role or all cache
 * @param role - Optional role to clear, if not provided clears all
 */
export function clearReportCache(role?: string) {
  if (role) {
    // Clear all entries for this role
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.startsWith(`${role}_`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache.delete(key));
    console.log(`[Report Cache] Cleared cache for role: ${role}`);
  } else {
    cache.clear();
    console.log('[Report Cache] Cleared all cache');
  }
}

/**
 * Get cache size (for debugging)
 */
export function getCacheSize(): number {
  return cache.size;
}

