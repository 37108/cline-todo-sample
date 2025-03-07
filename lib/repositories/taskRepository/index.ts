import { type Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../db";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../../domains/task/schema";

// エラー型の定義
export class TaskRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskRepositoryError";
  }
}

// データベースの行をタスクオブジェクトに変換する関数
function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    title: String(row.title),
    details: row.details ? String(row.details) : undefined,
    dueDate: row.due_date ? String(row.due_date) : undefined,
    status: (row.status ? String(row.status) : "pending") as Task["status"],
    priority: row.priority ? (String(row.priority) as Task["priority"]) : undefined,
    tags: row.tags ? (JSON.parse(String(row.tags)) as string[]) : undefined,
  };
}

// タスクオブジェクトをデータベースの行に変換する関数
function taskToRow(task: Partial<Task> & { id: string }): Record<string, unknown> {
  return {
    id: task.id,
    title: task.title,
    details: task.details || null,
    due_date: task.dueDate || null,
    status: task.status || "pending",
    priority: task.priority || null,
    tags: task.tags ? JSON.stringify(task.tags) : null,
  };
}

// タスクリポジトリの実装
export const taskRepository = {
  // 全てのタスクを取得
  async findAll(): Promise<Result<Task[], TaskRepositoryError>> {
    try {
      const db = await getDb();
      const rows = await db.all("SELECT * FROM tasks");
      return ok(rows.map(rowToTask));
    } catch (error) {
      return err(
        new TaskRepositoryError(
          `タスクの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  // IDによるタスクの取得
  async findById(id: string): Promise<Result<Task | null, TaskRepositoryError>> {
    try {
      const db = await getDb();
      const row = await db.get("SELECT * FROM tasks WHERE id = ?", id);

      if (!row) {
        return ok(null);
      }

      return ok(rowToTask(row));
    } catch (error) {
      return err(
        new TaskRepositoryError(
          `ID ${id} のタスク取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  // タスクの作成
  async create(input: CreateTaskInput): Promise<Result<Task, TaskRepositoryError>> {
    try {
      const db = await getDb();
      const id = uuidv4();
      const task = { id, ...input };
      const row = taskToRow(task);

      await db.run(
        `INSERT INTO tasks (id, title, details, due_date, status, priority, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        row.id,
        row.title,
        row.details,
        row.due_date,
        row.status,
        row.priority,
        row.tags,
      );

      return ok(task as Task);
    } catch (error) {
      return err(
        new TaskRepositoryError(
          `タスクの作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  // タスクの更新
  async update(
    id: string,
    input: UpdateTaskInput,
  ): Promise<Result<Task | null, TaskRepositoryError>> {
    try {
      const db = await getDb();

      // 既存のタスクを取得
      const existingResult = await this.findById(id);
      if (existingResult.isErr()) {
        return err(existingResult.error);
      }

      const existingTask = existingResult.value;
      if (!existingTask) {
        return ok(null);
      }

      // 更新するフィールドを準備
      const updatedTask = { ...existingTask, ...input };
      const row = taskToRow(updatedTask);

      // 更新クエリを構築
      const updates = Object.entries(row)
        .filter(([key]) => key !== "id")
        .map(([key]) => `${key.replace(/([A-Z])/g, "_$1").toLowerCase()} = ?`);

      const values = Object.entries(row)
        .filter(([key]) => key !== "id")
        .map(([_, value]) => value);

      await db.run(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`, ...values, id);

      return ok(updatedTask);
    } catch (error) {
      return err(
        new TaskRepositoryError(
          `タスクの更新に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },

  // タスクの削除
  async delete(id: string): Promise<Result<boolean, TaskRepositoryError>> {
    try {
      const db = await getDb();
      const result = await db.run("DELETE FROM tasks WHERE id = ?", id);
      return ok(result.changes !== undefined && result.changes > 0);
    } catch (error) {
      return err(
        new TaskRepositoryError(
          `タスクの削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  },
};
