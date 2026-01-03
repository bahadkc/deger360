# Critical Code Snippets - Production Auth Issues

## 1. Login Endpoint - Cookie Setting ✅

**File:** `src/app/api/login-admin/route.ts`

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
        cookiesToSet.push({ name, value, options: cookieOptions }); // ✅ Stores for response
      });
    },
  },
});

// Lines 174-193 or 207-226 (success response)
const successResponse = NextResponse.json({ ... });
cookiesToSet.forEach(({ name, value, options }) => {
  successResponse.cookies.set(name, value, options); // ✅ Adds to response
});
return successResponse;
```

**Status:** ✅ Correctly adds cookies to response

---

## 2. Get Case Endpoint - Cookie Reading & Response ✅

**File:** `src/app/api/get-case/[caseId]/route.ts`

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

// Lines 46-67: Cookie setting
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
        cookiesToSet.push({ name, value, options: cookieOptions }); // ✅
      });
    },
  },
});

// Lines 165: Success response with cookies
const successResponse = NextResponse.json({ case: data });
cookiesToSet.forEach(({ name, value, options }) => {
  successResponse.cookies.set(name, value, options); // ✅
});
return successResponse;
```

**Status:** ✅ Correctly reads cookies and adds to response

---

## 3. Update Case Assignments - MISSING Response Cookies ❌

**File:** `src/app/api/update-case-assignments/route.ts`

```typescript
// Lines 44-65: Cookie handling - PROBLEM HERE!
const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  cookies: {
    getAll() {
      return allCookies;
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        const cookieOptions = {
          ...options,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
        };
        cookieStore.set(name, value, cookieOptions);
        // ❌ MISSING: cookiesToSet.push() and response.cookies.set()
      });
    },
  },
});

// Lines 100-177: Response - NO COOKIES ADDED!
return NextResponse.json({
  success: true,
  message: 'Case assignments updated successfully',
  assignments: updatedAssignments,
});
// ❌ Missing: cookies not added to response
```

**Status:** ❌ **CRITICAL BUG** - Cookies not added to response

**Fix Needed:**
```typescript
// Add at top
const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

// In setAll:
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
    cookiesToSet.push({ name, value, options: cookieOptions }); // ✅ ADD THIS
  });
},

// In response:
const successResponse = NextResponse.json({ ... });
cookiesToSet.forEach(({ name, value, options }) => {
  successResponse.cookies.set(name, value, options); // ✅ ADD THIS
});
return successResponse;
```

---

## 4. Update Case Endpoint - Cookie Handling ✅

**File:** `src/app/api/update-case/route.ts`

```typescript
// Lines 45-82: Cookie setup with helper function
const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

const createResponse = (data: any, status: number = 200) => {
  const response = NextResponse.json(data, { status });
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
};

const supabaseClient = createServerClient(...);
// ... setAll stores cookies in cookiesToSet array ...

// All responses use createResponse helper
return createResponse({ case: updatedCase });
```

**Status:** ✅ Correctly adds cookies to all responses

---

## 5. Client-side Fetch Call ✅

**File:** `src/components/admin/case-tabs/general-info-tab.tsx`

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
```

**Status:** ✅ `credentials: 'include'` is present

---

## 6. Middleware Cookie Handling

**File:** `src/middleware.ts`

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
        response.cookies.set({ name, value, ...cookieOptions }); // ✅ Sets in response
      },
      remove(name: string, options: any) {
        req.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  }
);

// Line 202: Refresh session
await supabase.auth.getUser();
```

**Status:** ✅ Middleware correctly sets cookies in response

---

## Summary

| Endpoint | Reads Cookies | Sets Cookies in Response | Status |
|----------|---------------|-------------------------|--------|
| `login-admin` | ✅ | ✅ | ✅ Working |
| `get-case` | ✅ | ✅ | ✅ Working |
| `update-case` | ✅ | ✅ | ✅ Working |
| `update-case-assignments` | ✅ | ❌ | ❌ **BUG** |
| `check-admin-status` | ✅ | ✅ | ✅ Working |
| `middleware` | ✅ | ✅ | ✅ Working |

**Critical Issue:** `update-case-assignments` endpoint does NOT add cookies to response headers, which likely causes cookies to be lost after calling this endpoint.

