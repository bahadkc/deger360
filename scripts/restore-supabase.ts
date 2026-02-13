/**
 * Supabase Data Restore Script
 *
 * Imports backup data into a Supabase project.
 * Run: npm run supabase:restore [backup-folder]
 *
 * Set RESTORE_SUPABASE_URL and RESTORE_SUPABASE_SERVICE_KEY in .env.local
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

// Insert order (respects FK)
const TABLES = [
  "customers",
  "cases",
  "documents",
  "notifications",
  "admin_checklist",
  "skipped_documents",
  "user_auth",
  "case_admins",
] as const;

// Delete order (reverse FK - children first)
const TABLES_CLEAR_ORDER = [
  "case_admins",
  "admin_checklist",
  "skipped_documents",
  "documents",
  "notifications",
  "user_auth",
  "cases",
  "customers",
] as const;

function getLatestBackup(): string {
  const base = path.join(process.cwd(), "supabase-backup");
  if (!fs.existsSync(base)) return "";
  const dirs = fs.readdirSync(base).filter((d) => {
    const full = path.join(base, d);
    return fs.statSync(full).isDirectory();
  });
  dirs.sort().reverse();
  return dirs[0] || "";
}

async function main() {
  const backupDir =
    process.argv[2] ||
    path.join(process.cwd(), "supabase-backup", getLatestBackup());
  const url = process.env.RESTORE_SUPABASE_URL;
  const serviceKey = process.env.RESTORE_SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Set env vars in .env.local:\n" +
        "  RESTORE_SUPABASE_URL=https://your-project.supabase.co\n" +
        "  RESTORE_SUPABASE_SERVICE_KEY=your-service-role-key"
    );
    process.exit(1);
  }

  if (!fs.existsSync(backupDir)) {
    console.error(`Backup folder not found: ${backupDir}`);
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  console.log(`Restoring from ${backupDir} to ${url}\n`);

  // 1. Clear target tables (reverse FK order)
  console.log("Clearing target tables...");
  for (const table of TABLES_CLEAR_ORDER) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error(`Failed to clear ${table}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log("Cleared.\n");

  // 2. Insert backup data
  for (const table of TABLES) {
    const filePath = path.join(backupDir, `${table}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${table} (no backup file)`);
      continue;
    }

    process.stdout.write(`Importing ${table}... `);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const rows = JSON.parse(raw) as Record<string, unknown>[];

      if (rows.length === 0) {
        console.log("0 rows (empty)");
        continue;
      }

      const batchSize = 100;
      let imported = 0;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase.from(table).insert(batch);

        if (error) {
          // user_auth and case_admins need auth.users to exist in target project
          if (
            (table === "user_auth" || table === "case_admins") &&
            error.message?.includes("foreign key")
          ) {
            console.log(`\nSkipped (auth.users must exist in target - create users first)`);
            break;
          }
          console.error(`\nError: ${error.message}`);
          console.error("First failed row:", JSON.stringify(batch[0], null, 2));
          process.exit(1);
        }
        imported += batch.length;
      }

      if (imported > 0) console.log(`${imported} rows`);
    } catch (err) {
      console.error(`FAILED:`, err);
      process.exit(1);
    }
  }

  console.log("\nRestore complete!");
}

main();
