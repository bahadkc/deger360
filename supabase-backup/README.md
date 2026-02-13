# Supabase Data Backup & Restore

This folder contains backups of your Supabase data. Use it to copy data to a new Supabase project as a safety backup.

## Quick Start

### 1. Create a new Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Create a project (e.g. "deger360-backup")
4. Wait for it to be ready

### 2. Apply schema to the new project

Run your migrations on the new project:

```bash
# Link to new project (get project ref from dashboard URL)
npx supabase link --project-ref wfwubxhnmpaylievueui

# Push migrations
npx supabase db push
```

Or manually run the SQL from `supabase/migrations/` in the new project's SQL Editor.

### 3. Export data from current project

```bash
# Ensure .env.local has SUPABASE_SERVICE_ROLE_KEY (from current project)
npx tsx scripts/backup-supabase.ts
```

This creates `supabase-backup/YYYY-MM-DD/` with JSON files for each table.

### 4. Restore to new project

```bash
# Set env vars for the NEW project
$env:RESTORE_SUPABASE_URL="https://YOUR_NEW_PROJECT.supabase.co"
$env:RESTORE_SUPABASE_SERVICE_KEY="your-new-project-service-role-key"

npx tsx scripts/restore-supabase.ts supabase-backup/2026-02-13
```

## Tables backed up

| Table             | Rows (approx) | Notes                  |
|-------------------|---------------|------------------------|
| customers         | 100           |                        |
| cases             | 99            |                        |
| documents         | 294           | file_path refs storage |
| notifications     | 0             |                        |
| user_auth         | 67            | Links to auth.users    |
| admin_checklist   | 431           |                        |
| case_admins       | 207           | Links to auth.users    |
| skipped_documents | 26            |                        |
| auth_users.json   | 69            | Auth users (reference) |

## Auth users (user_auth & case_admins)

`user_auth` and `case_admins` reference `auth.users.id`. When restoring to a new project:

1. **Option A - Recreate users**: Create users in the new project via Supabase Auth (Dashboard → Authentication → Add user, or Admin API). Then run the restore - you may need to update `user_auth.id` and `case_admins.admin_id` to match the new auth user IDs.

2. **Option B - Export auth.users**: In the **current** project SQL Editor, run:
   ```sql
   SELECT id, email, created_at, raw_user_meta_data 
   FROM auth.users ORDER BY created_at;
   ```
   Save the result. Use Supabase Admin API `auth.admin.createUser()` in the new project to recreate each user, then import `user_auth` and `case_admins` with the new IDs.

## Storage (documents)

The `documents` table has `file_path` pointing to Supabase Storage. To copy files:

1. **Supabase Dashboard**: Storage → documents bucket → download files
2. **Or use rclone**: Configure Supabase S3-compatible storage
3. **Or script**: Use `supabase.storage.from('documents').download(path)` and re-upload to new project

Storage buckets: `documents`, `case-photos`, `public-images` (316 files total)

## Getting keys

- **Service Role Key**: Supabase Dashboard → Project Settings → API → `service_role` (secret!)
- **Project URL**: Supabase Dashboard → Project Settings → API → Project URL
