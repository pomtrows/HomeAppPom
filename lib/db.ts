import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";
import { SEED_MEALS } from "./seed-meals";

function createDatabase() {
  const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const DB_PATH = path.join(DATA_DIR, "app.db");
  const sqlite = new Database(DB_PATH, { timeout: 10000 });
  sqlite.pragma("busy_timeout = 10000");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS shopping_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      name TEXT NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      favicon_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const count = sqlite.prepare("SELECT COUNT(*) AS c FROM meals").get() as {
    c: number;
  };
  if (count.c === 0) {
    const insert = sqlite.prepare(
      "INSERT INTO meals (id, name, checked, sort_order, created_at) VALUES (?, ?, 0, ?, ?)"
    );
    const now = new Date().toISOString();
    sqlite.transaction(() => {
      SEED_MEALS.forEach((name, i) => {
        insert.run(crypto.randomUUID(), name, i, now);
      });
    })();
  }

  return drizzle(sqlite, { schema });
}

type DrizzleDb = ReturnType<typeof createDatabase>;

const globalForDb = globalThis as unknown as {
  __db?: DrizzleDb;
};

export function getDb(): DrizzleDb {
  if (!globalForDb.__db) {
    globalForDb.__db = createDatabase();
  }
  return globalForDb.__db;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    const instance = getDb() as any;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

