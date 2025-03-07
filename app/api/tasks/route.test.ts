import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { clearTestDb, closeTestDb, getTestDb } from "../../../lib/db/test";
import { GET, POST } from "./route";

// データベース接続をモック化
vi.mock("../../../lib/db", () => ({
  getDb: () => getTestDb(),
}));

describe("Tasks API", () => {
  beforeAll(async () => {
    await getTestDb();
  });

  afterEach(async () => {
    // 各テスト後にテーブルをクリア
    await clearTestDb();
  });

  afterAll(async () => {
    // テスト終了後にデータベース接続を閉じる
    await closeTestDb();
  });

  describe("GET /api/tasks", () => {
    it("should return an empty array when no tasks exist", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should return all tasks", async () => {
      // タスクを作成
      const db = await getTestDb();
      const taskId = "12345678-1234-1234-1234-123456789012";
      await db.run(
        "INSERT INTO tasks (id, title, status) VALUES (?, ?, ?)",
        taskId,
        "テストタスク",
        "pending",
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(taskId);
      expect(data[0].title).toBe("テストタスク");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "新しいタスク",
        details: "詳細情報",
        status: "pending",
      };

      const request = new NextRequest("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe(taskData.title);
      expect(data.details).toBe(taskData.details);
      expect(data.status).toBe(taskData.status);
      expect(data.id).toBeDefined();
    });

    it("should return 400 for invalid input", async () => {
      const invalidData = {
        // タイトルが欠けている
        details: "詳細情報",
      };

      const request = new NextRequest("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});
