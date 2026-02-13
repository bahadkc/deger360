# Migration Guide - Clean Schema

## Overview

The file `20260213180000_clean_initial_schema.sql` is a **consolidated migration** that represents the current production schema. Use it for fresh Supabase projects instead of the fragmented legacy migrations.

## Schema Summary

| Table | Purpose |
|-------|---------|
| `customers` | Customer records with IBAN, insurance, file tracking number |
| `cases` | Insurance cases linked to customers |
| `documents` | Case documents (storage file references) |
| `notifications` | Customer notifications |
| `user_auth` | Links auth.users to customers, stores role (customer/admin/lawyer/acente/superadmin) |
| `admin_checklist` | Admin task checklist per case |
| `case_admins` | Many-to-many: which admins/lawyers are assigned to which cases |
| `skipped_documents` | Document categories skipped per case |

## For Fresh Projects

### Option A: Replace all migrations (recommended)

1. **Backup** your current `supabase/migrations/` folder
2. **Delete** all migration files except:
   - `20260213180000_clean_initial_schema.sql`
3. **Reset** the migration history on your new Supabase project:
   - In Supabase Dashboard → SQL Editor, run:
   ```sql
   -- Only if starting completely fresh
   TRUNCATE supabase_migrations.schema_migrations;
   ```
4. **Push** the migration:
   ```bash
   npx supabase db push
   ```

### Option B: Keep both (for existing projects)

If your project already has the schema from old migrations:
- The clean migration will **fail** (tables already exist)
- Use the clean migration **only** for new projects
- Keep old migrations for existing projects

## First-Time Setup: Create Superadmin

After applying the clean migration, create your first admin user:

1. **Create user in Supabase Auth** (Dashboard → Authentication → Add user)
   - Email: your-admin@example.com
   - Password: (set one)

2. **Add to user_auth** via SQL Editor:
   ```sql
   INSERT INTO user_auth (id, customer_id, role)
   SELECT id, NULL, 'superadmin'
   FROM auth.users
   WHERE email = 'your-admin@example.com'
   LIMIT 1;
   ```

Or use your app's admin user creation flow if it uses the service role key.

## Storage Buckets

The migration creates:
- `documents` – case documents (50MB, pdf/images)
- `case-photos` – case photos (50MB, images)
- `public-images` – public images (10MB, images)

## Roles

| Role | Access |
|------|--------|
| `superadmin` | Full access, excludes sample customers |
| `admin` | Assigned cases only |
| `lawyer` | Assigned cases only |
| `acente` | View assigned cases, view-only |
| `customer` | Own data only |

## Removed Tables (from legacy schema)

These tables are **not** in the clean schema (they were removed):
- `process_steps`
- `customer_tasks`
- `activities`
- `payments`
