# Hydration Error #418 - Quick Reference

## The Problem
React hydration error in production build when accessing admin panel. Server HTML doesn't match client HTML.

## Most Likely Culprits

### 🔴 High Priority
1. **Admin Layout** (`src/app/admin/layout.tsx`)
   - Conditional rendering based on `isSuperAdminUser` (async state)
   - Email display conditional on `mounted` state
   - Lines: 108-140, 264-282, 216-220

2. **Login Page** (`src/app/admin/giris/page.tsx`)
   - Conditional rendering based on `mounted` state
   - Lines: 63-69, 72-126

3. **Conditional Layout** (`src/app/conditional-layout.tsx`)
   - Uses `usePathname()` which differs server vs client
   - Lines: 12-16

### 🟡 Medium Priority
4. **Admin Board** (`src/components/admin/admin-board.tsx`)
   - Async data loading
   - Conditional rendering

5. **Case Card** (`src/components/admin/case-card.tsx`)
   - Date calculations (should be in useEffect)
   - Number formatting

## Quick Fixes to Try

### Fix 1: Ensure Consistent Structure
```typescript
// BAD
if (!mounted) return <div>A</div>;
return <div>B</div>;

// GOOD
return <div>{!mounted ? <div>A</div> : <div>B</div>}</div>;
```

### Fix 2: Disable SSR for Admin
```typescript
export const dynamic = 'force-dynamic';
```

### Fix 3: Use Client-Only Components
```typescript
import dynamic from 'next/dynamic';
const AdminLayout = dynamic(() => import('./AdminLayout'), { ssr: false });
```

## Debug Commands

```bash
# Development mode (better errors)
npm run dev

# Check server HTML
curl http://192.168.1.108:3000/sys-admin-panel-secure-7x9k2m/giris

# Production build
npm run build && npm start
```

## Key Files to Check
- `src/app/admin/layout.tsx` ⚠️
- `src/app/admin/giris/page.tsx` ⚠️
- `src/app/conditional-layout.tsx` ⚠️
- `src/components/admin/admin-board.tsx`
- `src/components/admin/case-card.tsx`

## What's Already Fixed ✅
- Date formatting (uses DateDisplay component)
- Number formatting (uses NumberDisplay component)
- Direct Date.now() calls (moved to useEffect)
- Removed unnecessary suppressHydrationWarning

## Next Steps
1. Run in dev mode to see actual error
2. Compare server HTML vs client HTML
3. Check React DevTools for hydration warnings
4. Disable browser extensions
5. Check for invalid HTML nesting

See `HYDRATION_ERROR_ANALYSIS.md` for detailed analysis.

