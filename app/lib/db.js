import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "db", "aym_kararlar.db");

export function getDb() {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`DB bulunamadı: ${dbPath}`);
  }

  return new Database(dbPath, { readonly: true });
}