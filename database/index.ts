import path from "node:path";
import { type Database, open } from "sqlite";
import sqlite3 from "sqlite3";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  // データベースファイルのパスを設定
  const dbPath = path.resolve(process.cwd(), "todo.db");

  // データベース接続を開く
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // テーブルが存在しない場合は作成
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      details TEXT,
      due_date TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT,
      tags TEXT
    )
  `);

  return db;
}
