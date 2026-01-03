# Production Authentication Issues - Senior Developer Brief

## Problem Summary

**Errors:** 
- HTTP 418 (I'm a teapot)
- HTTP 423 (Locked)
- HTTP 401 (Unauthorized)

**Location:** Production (Vercel) - Admin Panel
**Impact:** 
- Admin panel login works initially
- After making changes (edit customer info → save), 401 Unauthorized errors occur
- `/api/get-case/[caseId]` returns 401 after update operations
- Admin gets logged out and cannot log back in
- Cookies are not being set/read properly in production

**Severity:** CRITICAL - Blocks core admin functionality

---

## Error Details

### Error Sequence
1. Admin logs in successfully ✅
2. Admin opens customer card ✅
3. Admin edits general info (finans section) ✅
4. Admin clicks "Kaydet" (Save) ✅
5. `update-case` API call succeeds ✅
6. Page reloads or `get-case` API is called ❌
7. **401 Unauthorized** error occurs
8. Admin gets logged out ❌

### Browser Console Errors
```
GET https://deger360.net/api/get-case/94c32d70-b709-4aab-9a1b-92d8d19426cb 401 (Unauthorized)
```

### Cookie Check (Client-side)
```javascript
const cookies = document.cookie.split(';').map(c => c.trim());
const supabaseCookies = cookies.filter(c => c.includes('sb-') || c.includes('supabase'));
console.log('📋 Tüm cookie sayısı:', cookies.length); // 1
console.log('🔐 Supabase cookie sayısı:', supabaseCookies.length); // 0
console.log('🔐 Supabase cookies:', supabaseCookies); // []
```

**Result:** No Supabase cookies found client-side (but they should be httpOnly, so this might be expected)

---

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Auth:** Supabase Auth (cookie-based sessions)
- **Deployment:** Vercel
- **Cookie Handling:** `@supabase/ssr` with Next.js `cookies()` API

### Authentication Flow
1. Admin logs in via `/api/login-admin`
2. Supabase SSR sets cookies via `setAll` callback
3. Cookies stored in `cookieStore` (Next.js cookies API)
4. Cookies also added to response headers
5. Subsequent API calls should include cookies automatically

---

## Key Code Sections

### 1. Login Endpoint (`src/app/api/login-admin/route.ts`)

**Purpose:** Handle admin login and set session cookies

**Key Code:**
```typescript
// Lines 50-80
const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  cookies: {
    getAll() {
      return allCookies;
    },
    setAll(cookiesToSetArray) {
      cookiesToSetArray.forEach(({ name, value, options }) => {
        const cookieOptions = {
          ...options,
          secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
          sameSite: 'lax' as const,
          path: '/',
          httpOnly: options?.httpOnly !== false,
          maxAge: options?.maxAge || 60 * 60 * 24 * 7,
        };
        cookieStore.set(name, value, cookieOptions);
        cookiesToSet.push({ name, value, options: cookieOptions });
      });
    },
  },
});

// After successful login (lines 174-193, 207-226)
const successResponse = NextResponse.json({ ... });
cookiesToSet.forEach(({ name, value, options }) => {
  successResponse.cookies.set(name, value, options);
});
return successResponse;
```

**Potential Issues:**
- Cookies might not be sent if `credentials: 'include'` is missing in fetch calls
- Cookie options might conflict with Vercel's edge runtime
- `httpOnly` cookies won't be visible client-side (expected behavior)

---

### 2. Get Case Endpoint (`src/app/api/get-case/[caseId]/route.ts`)

**Purpose:** Fetch case data with authentication check

**Key Code:**
```typescript
// Lines 25-44: Cookie reading
const cookieStore = await cookies();
const requestCookies = request.cookies.getAll();

const allCookiesMap = new Map<string, { name: string; value: string }>();
cookieStore.getAll().forEach(c => {
  allCookiesMap.set(c.name, { name: c.name, value: c.value });
});
requestCookies.forEach(c => {
  allCookiesMap.set(c.name, { name: c.name, value: c.value });
});

const allCookies = Array.from(allCookiesMap.values());

// Lines 46-67: Supabase client setup
const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];
const response = NextResponse.json({});

const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  cookies: {
    getAll() {
      return allCookies;
    },
    setAll(cookiesToSetArray) {
      cookiesToSetArray.forEach(({ name, value, options }) => {
        const cookieOptions = {
          ...options,
          secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
          sameSite: 'lax' as const,
          path: '/',
          httpOnly: options?.httpOnly !== false,
          maxAge: options?.maxAge || 60 * 60 * 24 * 7,
        };
        cookieStore.set(name, value, cookieOptions);
        cookiesToSet.push({ name, value, options: cookieOptions });
      });
    },
  },
});

// Lines 69-102: Authentication check with session refresh
let { data: { user }, error: userError } = await supabaseClient.auth.getUser();

if (userError || !user) {
  // Try to refresh session
  const { data: { session: currentSession } } = await supabaseClient.auth.getSession();
  if (currentSession) {
    const { data: { session }, error: refreshError } = await supabaseClient.auth.refreshSession();
    if (!refreshError && session) {
      const retryResult = await supabaseClient.auth.getUser();
      user = retryResult.data.user;
      userError = retryResult.error;
    }
  }
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized - Session expired or invalid' },
      { status: 401 }
    );
  }
}
```

**Potential Issues:**
- Cookies might not be sent from client (missing `credentials: 'include'`)
- Session refresh might fail silently
- Cookie domain/path mismatch between set and read
- Vercel edge runtime might handle cookies differently

---

### 3. Update Case Endpoint (`src/app/api/update-case/route.ts`)

**Purpose:** Update case and customer data

**Key Code:**
```typescript
// Lines 23-82: Similar cookie handling as get-case
const cookieStore = await cookies();
const requestCookies = request.cookies.getAll();
// ... merge cookies ...

const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

const createResponse = (data: any, status: number = 200) => {
  const response = NextResponse.json(data, { status });
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
};

const supabaseClient = createServerClient(...);
// ... auth check similar to get-case ...
```

**Potential Issues:**
- After update, cookies might be refreshed but not sent back properly
- Response cookies might not be applied correctly

---

### 4. Client-side Fetch Calls

**Location:** `src/components/admin/case-tabs/general-info-tab.tsx`

**Key Code:**
```typescript
// Line 393: Update case assignments
const assignmentsResponse = await fetch('/api/update-case-assignments', {
  method: 'POST',
  credentials: 'include', // ✅ Present
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    caseId: caseData.id,
    adminIds: assignedAdmins,
  }),
});

// Location: src/app/admin/musteriler/[caseId]/page.tsx
// Line 35: Get case data
const response = await fetch(`/api/get-case/${caseId}`, {
  method: 'GET',
  credentials: 'include', // ✅ Present
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Status:** `credentials: 'include'` is present ✅

---

### 5. Middleware (`src/middleware.ts`)

**Purpose:** Handle cookies and session refresh globally

**Key Code:**
```typescript
// Lines 160-199: Supabase client in middleware
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        const cookieOptions = {
          ...options,
          secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
          sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
          path: options?.path || '/',
          httpOnly: options?.httpOnly !== false,
        };
        req.cookies.set({ name, value, ...cookieOptions });
        response.cookies.set({ name, value, ...cookieOptions });
      },
      remove(name: string, options: any) {
        // ...
      },
    },
  }
);

// Line 202: Refresh session
await supabase.auth.getUser();
```

**Potential Issues:**
- Middleware runs on every request - might interfere with API routes
- Cookie options might conflict between middleware and API routes

---

### 6. Supabase Client (`src/lib/supabase/client.ts`)

**Purpose:** Client-side Supabase client initialization

**Key Code:**
```typescript
// Lines 18-55: Lazy initialization
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      supabaseUrl as string,
      supabaseAnonKey as string,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        // ...
      }
    );
  }
  return supabaseClient;
}

export const supabase = (() => {
  if (typeof window === 'undefined') {
    return {} as ReturnType<typeof createBrowserClient<Database>>;
  }
  return getSupabaseClient()!;
})();
```

**Potential Issues:**
- SSR hydration mismatch
- Client-side client might not sync with server-side cookies

---

## Hypotheses & Questions for Senior Developer

### Hypothesis 1: Cookie Domain/Path Mismatch
**Question:** Are cookies being set with the correct domain/path for Vercel production?
- Cookies set with `path: '/'` 
- But Vercel might require different domain settings?
- Should we explicitly set `domain` option?

### Hypothesis 2: Cookie Not Sent in Subsequent Requests
**Question:** Even though `credentials: 'include'` is present, are cookies actually being sent?
- Check Network tab → Request Headers → Cookie header
- Are Supabase cookies present in the request?

### Hypothesis 3: Session Refresh Failing
**Question:** Is the session refresh mechanism working correctly?
- `refreshSession()` is called but might fail silently
- Should we add more logging?
- Is the refresh token cookie being read correctly?

### Hypothesis 4: Vercel Edge Runtime Cookie Handling
**Question:** Does Vercel's edge runtime handle cookies differently?
- Are we using the correct Next.js API for cookies?
- Should we use `request.cookies` instead of `cookies()` from `next/headers`?
- Edge runtime limitations?

### Hypothesis 5: Cookie Options Conflict
**Question:** Are cookie options conflicting between different parts of the app?
- Middleware sets cookies with certain options
- API routes set cookies with different options
- Which takes precedence?

### Hypothesis 6: Response Cookie Not Applied
**Question:** Are cookies in response headers actually being applied by the browser?
- Check Network tab → Response Headers → Set-Cookie
- Are cookies present?
- Are they being blocked by browser security?

---

## Debugging Checklist

### Server-side Checks
- [ ] Check Vercel logs for cookie-related errors
- [ ] Verify environment variables are set correctly
- [ ] Check if cookies are being set in response headers
- [ ] Verify session refresh is working

### Client-side Checks
- [ ] Network tab → Check Request Headers → Cookie header
- [ ] Network tab → Check Response Headers → Set-Cookie header
- [ ] Application tab → Cookies → Are Supabase cookies present?
- [ ] Console → Check for cookie-related errors

### Code Checks
- [ ] All fetch calls have `credentials: 'include'`
- [ ] Cookie options are consistent across all endpoints
- [ ] Session refresh logic is correct
- [ ] Error handling for auth failures

---

## Specific Questions for Senior Developer

1. **Cookie Visibility:** Supabase cookies are `httpOnly`, so they won't appear in `document.cookie`. Is this expected, or should we see them in Application → Cookies?

2. **Cookie Persistence:** After login, cookies are set. But after `update-case` → `get-case`, cookies seem to be lost. Why?

3. **Session Refresh:** We're calling `refreshSession()` but it might not be working. What's the correct way to refresh Supabase sessions in Next.js App Router?

4. **Vercel Edge Runtime:** Are there specific considerations for cookie handling in Vercel's edge runtime?

5. **Cookie Options:** Are our cookie options (`secure`, `sameSite`, `httpOnly`, `path`) correct for production?

6. **Multiple Cookie Sources:** We're merging cookies from `cookieStore` and `request.cookies`. Is this correct, or should we use only one source?

7. **Response Cookie Setting:** We're setting cookies in response via `response.cookies.set()`. Is this the correct approach, or should cookies be set differently?

8. **418/423 Errors:** What could cause HTTP 418 and 423 errors? These are unusual status codes.

---

## Files to Review

1. `src/app/api/login-admin/route.ts` - Login endpoint
2. `src/app/api/get-case/[caseId]/route.ts` - Get case endpoint (401 error here)
3. `src/app/api/update-case/route.ts` - Update case endpoint
4. `src/app/api/update-case-assignments/route.ts` - Update assignments endpoint
5. `src/app/api/check-admin-status/route.ts` - Check admin status endpoint
6. `src/middleware.ts` - Global middleware
7. `src/lib/supabase/client.ts` - Client-side Supabase client
8. `src/components/admin/case-tabs/general-info-tab.tsx` - Client component making API calls
9. `src/app/admin/musteriler/[caseId]/page.tsx` - Page component calling get-case

---

## Additional Endpoint: update-case-assignments

**Location:** `src/app/api/update-case-assignments/route.ts`

**Issue:** This endpoint does NOT add cookies to response headers (unlike others)

**Key Code:**
```typescript
// Lines 49-63: Cookie handling - NO response cookies!
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) => {
    const cookieOptions = {
      ...options,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
    cookieStore.set(name, value, cookieOptions);
    // ❌ Missing: cookiesToSet.push() and response.cookies.set()
  });
},
```

**Problem:** Cookies are set in `cookieStore` but NOT added to response headers. This might cause cookies to be lost after this API call.

---

## Additional Endpoint: check-admin-status

**Location:** `src/app/api/check-admin-status/route.ts`

**Purpose:** Check if current user is admin

**Key Code:**
```typescript
// Similar cookie handling pattern
// Has production cookie options
// Adds cookies to response ✅
```

**Status:** This endpoint properly adds cookies to response ✅

---

## Environment Details

- **Framework:** Next.js 14.2.x
- **Runtime:** Node.js (Vercel)
- **Auth Library:** @supabase/ssr
- **Deployment:** Vercel Production
- **Domain:** deger360.net
- **HTTPS:** Yes (required for secure cookies)

---

## Next Steps

1. Review cookie handling in all API endpoints
2. Verify cookie options are correct for production
3. Check if Vercel has specific cookie requirements
4. Test session refresh mechanism
5. Verify cookies are being sent in requests
6. Check response headers for Set-Cookie

---

## Additional Context

- **Local Development:** Works fine ✅
- **Production:** Fails ❌
- **Cookie Count:** 1 cookie total, 0 Supabase cookies (client-side check)
- **Error Pattern:** Always happens after update operations
- **Session:** Initially valid, becomes invalid after operations

