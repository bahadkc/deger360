# Supabase Database Access

This directory contains all Supabase database utilities and configurations for the project.

## 📁 File Structure

- **`client.ts`** - Browser/client-side Supabase client
- **`server.ts`** - Server-side Supabase client for Server Components
- **`admin.ts`** - Admin client with service role key (bypasses RLS)
- **`database.types.ts`** - TypeScript types generated from your database schema
- **`db.ts`** - Comprehensive database access utilities
- **`api.ts`** - High-level API functions for common operations
- **`hooks.ts`** - React hooks for data fetching
- **`auth.ts`** - Authentication utilities
- **`explorer.ts`** - Database exploration and debugging utilities
- **`index.ts`** - Main export file

## 🚀 Quick Start

### Import Everything

```typescript
import { db, supabase, testConnection } from '@/lib/supabase';
```

### Basic Usage

```typescript
// Get all customers
const customers = await db.customers.getAll();

// Get customer by ID
const customer = await db.customers.getById('customer-id');

// Get cases for a customer
const cases = await db.cases.getByCustomerId('customer-id');

// Insert a new case
const newCase = await db.cases.insert({
  customer_id: 'customer-id',
  case_number: 'DK-2024-001',
  vehicle_plate: '34ABC123',
  vehicle_brand_model: 'Toyota Corolla',
  accident_date: '2024-01-15',
});

// Update a case
await db.cases.update('case-id', {
  status: 'completed',
  current_stage: 'ödeme',
});

// Get documents for a case
const documents = await db.documents.getByCaseId('case-id');
```

### Using Generic Database Access

```typescript
import { DatabaseAccess } from '@/lib/supabase';

// Get all records from any table
const allCases = await DatabaseAccess.getAll('cases', {
  orderBy: 'created_at',
  ascending: false,
  limit: 10,
});

// Get by any field
const activeCases = await DatabaseAccess.getByField('cases', 'status', 'active');

// Insert
const newDoc = await DatabaseAccess.insert('documents', {
  case_id: 'case-id',
  name: 'document.pdf',
  file_path: 'path/to/file',
  category: 'kaza_tutanağı',
});

// Update
await DatabaseAccess.update('cases', 'case-id', {
  status: 'completed',
});

// Delete
await DatabaseAccess.delete('documents', 'doc-id');
```

### Server-Side Usage

```typescript
import { getServerDb } from '@/lib/supabase';

// In Server Components or API routes
const serverDb = getServerDb();
const customers = await serverDb.customers.getAll();
```

### Admin Operations (Bypasses RLS)

```typescript
import { dbAdmin } from '@/lib/supabase';

// Use admin client for operations that bypass RLS
const allCustomers = await dbAdmin.customers.getAll();
```

### Database Exploration

```typescript
import { getDatabaseOverview, testConnection } from '@/lib/supabase';

// Test connection
const connection = await testConnection();
console.log(connection);

// Get full database overview
const overview = await getDatabaseOverview();
console.log(overview);
```

## 📊 Available Tables

1. **customers** - Customer information
2. **cases** - Legal cases/dossiers
3. **documents** - Case documents
4. **process_steps** - Process workflow steps
5. **customer_tasks** - Tasks assigned to customers
6. **activities** - Activity log/feed
7. **payments** - Payment records
8. **notifications** - Customer notifications
9. **user_auth** - User authentication mapping

## 🔐 Authentication

```typescript
import { loginWithCaseNumber, getCurrentCustomer } from '@/lib/supabase';

// Login with file tracking number
await loginWithCaseNumber('DK-2024-001', 'password');

// Get current customer
const customer = await getCurrentCustomer();
```

## 🎣 React Hooks

```typescript
import { useCase, useDocuments, useNotifications } from '@/lib/supabase';

function MyComponent({ caseId }: { caseId: string }) {
  const { data: caseData, loading, error } = useCase(caseId);
  const { data: documents, refetch } = useDocuments(caseId);
  const { data: notifications, unreadCount } = useNotifications(customerId);

  // Use the data...
}
```

## 🔍 Database Explorer

```typescript
import {
  getDatabaseStats,
  getTableStructure,
  getTableRelationships,
} from '@/lib/supabase';

// Get statistics for all tables
const stats = await getDatabaseStats();

// Get structure of a specific table
const structure = await getTableStructure('cases');

// Get relationships between tables
const relationships = getTableRelationships();
```

## ⚠️ Important Notes

1. **Environment Variables**: Make sure `.env.local` has:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

2. **RLS Policies**: The regular `db` utilities respect Row Level Security policies. Use `dbAdmin` only when you need to bypass RLS.

3. **Server vs Client**: Use `getServerDb()` in Server Components and API routes. Use `db` directly in Client Components.

4. **Type Safety**: All operations are fully typed based on your database schema in `database.types.ts`.

## 📝 Examples

See the existing API files (`api.ts`, `hooks.ts`) for more examples of how to use these utilities.
