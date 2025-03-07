import { z } from "zod";

// タスクのステータス
export const TaskStatus = z.enum(["pending", "in_progress", "completed", "cancelled"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

// タスクの優先度
export const TaskPriority = z.enum(["low", "medium", "high", "urgent"]);
export type TaskPriority = z.infer<typeof TaskPriority>;

// タスクのスキーマ
export const Task = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  details: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
  status: TaskStatus.default("pending"),
  priority: TaskPriority.optional(),
  tags: z.array(z.string()).optional(),
});
export type Task = z.infer<typeof Task>;

// タスク作成用のスキーマ (IDはサーバー側で生成)
export const CreateTaskInput = Task.omit({ id: true });
export type CreateTaskInput = z.infer<typeof CreateTaskInput>;

// タスク更新用のスキーマ
export const UpdateTaskInput = CreateTaskInput.partial();
export type UpdateTaskInput = z.infer<typeof UpdateTaskInput>;
