/**
 * Supabase Data Backup Script
 *
 * Exports data from the current Supabase project to JSON files.
 * Run: npm run supabase:backup
 *
 * Uses NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const TABLES = [
  "customers",
  "cases",
  "documents",
  "notifications",
  "user_auth",
  "admin_checklist",
  "case_admins",
  "skipped_documents",
] as const;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllRows(supabase: any, table: string) {
  const rows: unknown[] = [];
  let from = 0;
  const pageSize = 500;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Error fetching ${table}: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Set in .env.local:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL=...\n" +
        "  SUPABASE_SERVICE_ROLE_KEY=..."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  const timestamp = new Date().toISOString().slice(0, 10);
  const backupDir = path.join(process.cwd(), "supabase-backup", timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`Backing up from ${url} to ${backupDir}\n`);

  for (const table of TABLES) {
    process.stdout.write(`Exporting ${table}... `);
    try {
      const rows = await fetchAllRows(supabase, table);
      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), "utf-8");
      console.log(`${rows.length} rows`);
    } catch (err) {
      console.error(`FAILED:`, err);
      process.exit(1);
    }
  }

  console.log("\nBackup complete!");
}

main();
