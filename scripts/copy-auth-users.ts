/**
 * Copy auth users from main to backup Supabase project.
 * Creates users in backup with same emails (new IDs), then updates user_auth/case_admins.
 *
 * Run: npm run supabase:copy-auth
 *
 * Requires in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (main - source)
 * - RESTORE_SUPABASE_URL, RESTORE_SUPABASE_SERVICE_KEY (backup - target)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env then .env.local
for (const name of [".env", ".env.local"]) {
  const p = path.join(process.cwd(), name);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const mainKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const backupUrl = process.env.RESTORE_SUPABASE_URL;
  const backupKey = process.env.RESTORE_SUPABASE_SERVICE_KEY;

  if (!mainUrl || !mainKey || !backupUrl || !backupKey) {
    console.error("Set in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESTORE_SUPABASE_URL, RESTORE_SUPABASE_SERVICE_KEY");
    process.exit(1);
  }

  const mainSupabase = createClient(mainUrl, mainKey);
  const backupSupabase = createClient(backupUrl, backupKey);

  console.log("Fetching users from main...");
  const { data: { users: mainUsers }, error: listErr } = await mainSupabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) {
    console.error("Failed to list main users:", listErr.message);
    process.exit(1);
  }
  if (!mainUsers || mainUsers.length === 0) {
    console.log("No users in main.");
    return;
  }

  console.log(`Found ${mainUsers.length} users. Creating in backup...`);

  const oldToNewId = new Map<string, string>();

  for (const u of mainUsers) {
    if (!u.email) continue;
    const { data: newUser, error } = await backupSupabase.auth.admin.createUser({
      email: u.email,
      password: crypto.randomUUID().replace(/-/g, "").slice(0, 16) + "Aa1!", // temp password
      email_confirm: true,
      user_metadata: u.user_metadata || {},
    });
    if (error) {
      if (error.message?.includes("already been registered")) {
        const { data: existing } = await backupSupabase.auth.admin.listUsers();
        const found = existing?.users?.find((x) => x.email === u.email);
        if (found) {
          oldToNewId.set(u.id, found.id);
          process.stdout.write(".");
          continue;
        }
      }
      console.error(`\nFailed to create ${u.email}:`, error.message);
      continue;
    }
    if (newUser?.user?.id) {
      oldToNewId.set(u.id, newUser.user.id);
    }
    process.stdout.write(".");
  }

  console.log(`\nMapped ${oldToNewId.size} users.`);

  // Load user_auth and case_admins from backup folder
  const backupDir = process.argv[2] || path.join(process.cwd(), "supabase-backup", getLatestBackup());
  const userAuthPath = path.join(backupDir, "user_auth.json");
  const caseAdminsPath = path.join(backupDir, "case_admins.json");

  if (!fs.existsSync(userAuthPath) || !fs.existsSync(caseAdminsPath)) {
    console.error(`Backup folder not found or missing user_auth/case_admins: ${backupDir}`);
    process.exit(1);
  }

  const userAuthRows = JSON.parse(fs.readFileSync(userAuthPath, "utf-8")) as Record<string, unknown>[];
  const caseAdminsRows = JSON.parse(fs.readFileSync(caseAdminsPath, "utf-8")) as Record<string, unknown>[];

  const remappedUserAuth = userAuthRows.map((r) => {
    const oldId = r.id as string;
    const newId = oldToNewId.get(oldId);
    if (!newId) return null;
    return { ...r, id: newId };
  }).filter(Boolean) as Record<string, unknown>[];

  const remappedCaseAdmins = caseAdminsRows.map((r) => {
    const oldAdminId = r.admin_id as string;
    const newAdminId = oldToNewId.get(oldAdminId);
    if (!newAdminId) return null;
    return { ...r, admin_id: newAdminId };
  }).filter(Boolean) as Record<string, unknown>[];

  console.log(`Restoring user_auth (${remappedUserAuth.length} rows)...`);
  for (let i = 0; i < remappedUserAuth.length; i += 100) {
    const batch = remappedUserAuth.slice(i, i + 100);
    const { error } = await backupSupabase.from("user_auth").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error("user_auth error:", error.message);
      process.exit(1);
    }
  }

  console.log(`Restoring case_admins (${remappedCaseAdmins.length} rows)...`);
  for (let i = 0; i < remappedCaseAdmins.length; i += 100) {
    const batch = remappedCaseAdmins.slice(i, i + 100);
    const { error } = await backupSupabase.from("case_admins").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error("case_admins error:", error.message);
      process.exit(1);
    }
  }

  console.log("\nDone! Users have temporary passwords - they can reset via 'Forgot password'.");
}

function getLatestBackup(): string {
  const base = path.join(process.cwd(), "supabase-backup");
  if (!fs.existsSync(base)) return "";
  const dirs = fs.readdirSync(base).filter((d) => fs.statSync(path.join(base, d)).isDirectory());
  dirs.sort().reverse();
  return dirs[0] || "";
}

main();
