# Quick Reference - Production Auth Issues

## TL;DR

**Problem:** After admin login → edit customer → save → page reload → **401 Unauthorized**

**Root Cause Hypothesis:** Cookies not being persisted/sent correctly in production (Vercel)

**Key Files:**
1. `src/app/api/login-admin/route.ts` - Sets cookies ✅
2. `src/app/api/get-case/[caseId]/route.ts` - Reads cookies, returns 401 ❌
3. `src/app/api/update-case-assignments/route.ts` - **Missing response cookies** ❌

---

## Critical Issue Found

### `update-case-assignments` endpoint is missing response cookies!

**File:** `src/app/api/update-case-assignments/route.ts` (Lines 49-63)

**Current Code:**
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) => {
    cookieStore.set(name, value, cookieOptions);
    // ❌ Missing: response.cookies.set()
  });
},
```

**Should be:**
```typescript
const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

setAll(cookiesToSetArray) {
  cookiesToSetArray.forEach(({ name, value, options }) => {
    cookieStore.set(name, value, cookieOptions);
    cookiesToSet.push({ name, value, options: cookieOptions }); // ✅
  });
},

// Then in response:
const response = NextResponse.json({ ... });
cookiesToSet.forEach(({ name, value, options }) => {
  response.cookies.set(name, value, options); // ✅
});
```

**Impact:** After calling this endpoint, cookies might be lost, causing subsequent `get-case` calls to fail with 401.

---

## Questions for Senior Developer

1. **Cookie Persistence:** Why do cookies disappear after `update-case-assignments` → `get-case` sequence?

2. **Response Cookies:** Should ALL API endpoints that use Supabase SSR add cookies to response headers, or only login endpoints?

3. **Vercel Edge Runtime:** Are there specific cookie handling requirements for Vercel's edge runtime?

4. **Session Refresh:** Is our session refresh logic correct? Should we refresh on every request or only on failure?

5. **Cookie Options:** Are our cookie options (`secure`, `sameSite: 'lax'`, `httpOnly`, `path: '/'`) correct for production?

6. **Multiple Cookie Sources:** We merge cookies from `cookieStore` and `request.cookies`. Is this correct?

---

## Test Sequence

1. Login → ✅ Works
2. Open customer card → ✅ Works  
3. Edit customer info → ✅ Works
4. Click "Kaydet" → ✅ Works (update-case succeeds)
5. Page reloads → ❌ **401 Unauthorized** (get-case fails)

**Hypothesis:** Cookies are lost between step 4 and 5.

---

## Quick Fix to Try

Add response cookie handling to `update-case-assignments` endpoint (same pattern as `login-admin` and `get-case`).

See full analysis: `PRODUCTION_AUTH_ISSUES_ANALYSIS.md`

