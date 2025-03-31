// アプリケーション全体で使用する定数
export const MAX_TASKS_PER_PAGE = 30 as const;

// タスクのステータスに関する定数
export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// タスクの優先度に関する定数
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;
