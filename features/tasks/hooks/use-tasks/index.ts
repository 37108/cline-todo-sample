import type { Task } from "@/features/tasks/models/schema";
import { useCallback, useEffect, useState } from "react";

export type TaskWithClientData = Task & {
  isExpired?: boolean;
  isNearDeadline?: boolean;
};

export function useTasks() {
  const [tasks, setTasks] = useState<TaskWithClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // タスクを取得する
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", { next: { tags: ["/tasks"] } });
      if (!response.ok) {
        throw new Error("タスクの取得に失敗しましたわ");
      }
      const data = await response.json();

      // クライアント側のデータを追加
      const tasksWithClientData = data.map((task: Task): TaskWithClientData => {
        const taskWithClientData: TaskWithClientData = { ...task };

        // 期限切れかどうかをチェック
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const now = new Date();

          // 期限切れ
          if (dueDate < now) {
            taskWithClientData.isExpired = true;
          }

          // 期限が3日以内
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(now.getDate() + 3);
          if (dueDate <= threeDaysFromNow && dueDate >= now) {
            taskWithClientData.isNearDeadline = true;
          }
        }

        return taskWithClientData;
      });

      setTasks(tasksWithClientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しましたわ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // タスクを作成する
  const createTask = useCallback(
    async (taskData: Omit<Task, "id">) => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
          next: {
            tags: ["/tasks"],
          },
        });

        if (!response.ok) {
          throw new Error("タスクの作成に失敗しましたわ");
        }

        const newTask = await response.json();
        await fetchTasks(); // タスク一覧を再取得
        return newTask;
      } catch (err) {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しましたわ");
        throw err;
      }
    },
    [fetchTasks],
  );

  // タスクを更新する
  const updateTask = useCallback(
    async (id: string, taskData: Partial<Task>) => {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
          next: {
            tags: ["/tasks"],
          },
        });

        if (!response.ok) {
          throw new Error("タスクの更新に失敗しましたわ");
        }

        const updatedTask = await response.json();
        await fetchTasks(); // タスク一覧を再取得
        return updatedTask;
      } catch (err) {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しましたわ");
        throw err;
      }
    },
    [fetchTasks],
  );

  // タスクを削除する
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
          next: {
            tags: ["/tasks"],
          },
        });

        if (!response.ok) {
          throw new Error("タスクの削除に失敗しましたわ");
        }

        await fetchTasks(); // タスク一覧を再取得
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しましたわ");
        throw err;
      }
    },
    [fetchTasks],
  );

  // タスクを取得する（単一）
  const getTask = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, { next: { tags: [`/tasks/${id}`] } });
      if (!response.ok) {
        throw new Error("タスクの取得に失敗しましたわ");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しましたわ");
      throw err;
    }
  }, []);

  // ステータスでタスクをフィルタリングする
  const getTasksByStatus = useCallback(
    (status: string) => {
      return tasks.filter((task) => task.status === status);
    },
    [tasks],
  );

  // 初期化時にタスクを取得
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    getTasksByStatus,
  };
}
