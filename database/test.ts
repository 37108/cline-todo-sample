import { type Database, open } from "sqlite";
import sqlite3 from "sqlite3";

let testDb: Database | null = null;

export async function getTestDb(): Promise<Database> {
  if (testDb) return testDb;

  // テスト用のインメモリデータベースを使用
  testDb = await open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });

  // テーブルを作成
  await testDb.exec(`
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

  return testDb;
}

export async function closeTestDb(): Promise<void> {
  if (testDb) {
    await testDb.close();
    testDb = null;
  }
}

export async function clearTestDb(): Promise<void> {
  if (testDb) {
    await testDb.exec("DELETE FROM tasks");
  }
}
