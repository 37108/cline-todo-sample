import { v4 as uuidv4 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { clearTestDb, closeTestDb, getTestDb } from "../../db/test";
import { taskRepository } from "./index";

// リポジトリのデータベース接続をモック化
vi.mock("../../db", () => ({
  getDb: () => getTestDb(),
}));

describe("taskRepository", () => {
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

  describe("create", () => {
    it("should create a task successfully", async () => {
      const input = {
        title: "テストタスク",
        details: "これはテストです",
        status: "pending" as const,
      };

      const result = await taskRepository.create(input);
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toMatchObject({
          title: input.title,
          details: input.details,
          status: input.status,
        });
        expect(result.value.id).toBeDefined();
      }
    });
  });

  describe("findById", () => {
    it("should find a task by id", async () => {
      // タスクを作成
      const input = {
        title: "検索テスト",
        details: "IDで検索するテスト",
        status: "in_progress" as const,
      };
      const createResult = await taskRepository.create(input);
      expect(createResult.isOk()).toBe(true);

      if (createResult.isOk()) {
        const taskId = createResult.value.id;

        // 作成したタスクをIDで検索
        const findResult = await taskRepository.findById(taskId);
        expect(findResult.isOk()).toBe(true);

        if (findResult.isOk()) {
          expect(findResult.value).toMatchObject({
            id: taskId,
            title: input.title,
            details: input.details,
            status: input.status,
          });
        }
      }
    });

    it("should return null for non-existent task", async () => {
      const nonExistentId = uuidv4();
      const result = await taskRepository.findById(nonExistentId);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("findAll", () => {
    it("should find all tasks", async () => {
      // 複数のタスクを作成
      const tasks = [
        { title: "タスク1", status: "pending" as const },
        { title: "タスク2", status: "in_progress" as const },
        { title: "タスク3", status: "completed" as const },
      ];

      for (const task of tasks) {
        const result = await taskRepository.create(task);
        expect(result.isOk()).toBe(true);
      }

      // 全タスクを取得
      const findAllResult = await taskRepository.findAll();
      expect(findAllResult.isOk()).toBe(true);

      if (findAllResult.isOk()) {
        expect(findAllResult.value.length).toBe(tasks.length);

        // タイトルでソートして比較
        const sortedTasks = [...findAllResult.value].sort((a, b) => a.title.localeCompare(b.title));
        const expectedTitles = tasks.map((t) => t.title).sort();

        sortedTasks.forEach((task, index) => {
          expect(task.title).toBe(expectedTitles[index]);
        });
      }
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      // タスクを作成
      const input = {
        title: "更新前",
        details: "更新テスト",
        status: "pending" as const,
      };

      const createResult = await taskRepository.create(input);
      expect(createResult.isOk()).toBe(true);

      if (createResult.isOk()) {
        const taskId = createResult.value.id;

        // タスクを更新
        const updateData = {
          title: "更新後",
          status: "completed" as const,
        };

        const updateResult = await taskRepository.update(taskId, updateData);
        expect(updateResult.isOk()).toBe(true);

        if (updateResult.isOk()) {
          expect(updateResult.value).toMatchObject({
            id: taskId,
            title: updateData.title,
            details: input.details, // 更新していない項目は元の値が保持される
            status: updateData.status,
          });

          // 更新されたことを確認
          const findResult = await taskRepository.findById(taskId);
          expect(findResult.isOk()).toBe(true);

          if (findResult.isOk() && findResult.value) {
            expect(findResult.value.title).toBe(updateData.title);
            expect(findResult.value.status).toBe(updateData.status);
          }
        }
      }
    });

    it("should return null for non-existent task update", async () => {
      const nonExistentId = uuidv4();
      const updateData = { title: "存在しないタスク" };

      const result = await taskRepository.update(nonExistentId, updateData);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("delete", () => {
    it("should delete a task", async () => {
      // タスクを作成
      const input = { title: "削除テスト", status: "pending" as const };
      const createResult = await taskRepository.create(input);
      expect(createResult.isOk()).toBe(true);

      if (createResult.isOk()) {
        const taskId = createResult.value.id;

        // タスクを削除
        const deleteResult = await taskRepository.delete(taskId);
        expect(deleteResult.isOk()).toBe(true);

        if (deleteResult.isOk()) {
          expect(deleteResult.value).toBe(true);

          // 削除されたことを確認
          const findResult = await taskRepository.findById(taskId);
          expect(findResult.isOk()).toBe(true);

          if (findResult.isOk()) {
            expect(findResult.value).toBeNull();
          }
        }
      }
    });

    it("should return false for non-existent task deletion", async () => {
      const nonExistentId = uuidv4();
      const result = await taskRepository.delete(nonExistentId);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(false);
      }
    });
  });
});
