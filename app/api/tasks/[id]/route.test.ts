import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDb, closeTestDb, getTestDb } from "../../../../lib/db/test";
import { DELETE, GET, PUT } from "./route";

// データベース接続をモック化
vi.mock("../../../../lib/db", () => ({
  getDb: () => getTestDb(),
}));

describe("Task API with ID", () => {
  const taskId = "12345678-1234-1234-1234-123456789012";

  beforeAll(async () => {
    await getTestDb();
  });

  beforeEach(async () => {
    // 各テスト前にテストデータを挿入
    const db = await getTestDb();
    await db.run(
      "INSERT INTO tasks (id, title, details, status) VALUES (?, ?, ?, ?)",
      taskId,
      "テストタスク",
      "詳細情報",
      "pending",
    );
  });

  afterEach(async () => {
    // 各テスト後にテーブルをクリア
    await clearTestDb();
  });

  afterAll(async () => {
    // テスト終了後にデータベース接続を閉じる
    await closeTestDb();
  });

  describe("GET /api/tasks/[id]", () => {
    it("should return a task by id", async () => {
      const response = await GET(new NextRequest(`http://localhost/api/tasks/${taskId}`), {
        params: { id: taskId },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(taskId);
      expect(data.title).toBe("テストタスク");
      expect(data.details).toBe("詳細情報");
    });

    it("should return 404 for non-existent task", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const response = await GET(new NextRequest(`http://localhost/api/tasks/${nonExistentId}`), {
        params: { id: nonExistentId },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe("PUT /api/tasks/[id]", () => {
    it("should update a task", async () => {
      const updateData = {
        title: "更新されたタスク",
        status: "completed",
      };

      const request = new NextRequest(`http://localhost/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(taskId);
      expect(data.title).toBe(updateData.title);
      expect(data.status).toBe(updateData.status);
      expect(data.details).toBe("詳細情報"); // 更新していない項目は元の値が保持される
    });

    it("should return 404 for non-existent task update", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const updateData = {
        title: "存在しないタスク",
      };

      const request = new NextRequest(`http://localhost/api/tasks/${nonExistentId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: nonExistentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("should return 400 for invalid input", async () => {
      const invalidData = {
        status: "invalid_status", // 無効なステータス
      };

      const request = new NextRequest(`http://localhost/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(invalidData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    it("should delete a task", async () => {
      const response = await DELETE(new NextRequest(`http://localhost/api/tasks/${taskId}`), {
        params: { id: taskId },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // 削除されたことを確認
      const db = await getTestDb();
      const task = await db.get("SELECT * FROM tasks WHERE id = ?", taskId);
      expect(task).toBeUndefined();
    });

    it("should return 404 for non-existent task deletion", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const response = await DELETE(
        new NextRequest(`http://localhost/api/tasks/${nonExistentId}`),
        { params: { id: nonExistentId } },
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });
});
