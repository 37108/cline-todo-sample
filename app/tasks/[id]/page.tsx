import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TaskDetailClient } from "@/features/tasks/components/task-detail-client";
import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";

// メタデータの設定
export const metadata: Metadata = {
  title: "タスク詳細",
  description: "タスクの詳細情報を表示します",
};

// タスク詳細ページ
export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  // サーバーサイドでタスクを取得
  const getTask = async () => {
    try {
      // 絶対URLを使用
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const response = await fetch(`${baseUrl}/api/tasks/${params.id}`, {
        next: { tags: [`/tasks/${params.id}`] },
      });

      if (!response.ok) {
        throw new Error("タスクの取得に失敗しました");
      }

      return await response.json();
    } catch (error) {
      console.error("タスク取得エラー:", error);
      return null;
    }
  };

  const task = await getTask();

  // タスクが見つからない場合
  if (!task) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>タスクが見つかりません</AlertDescription>
      </Alert>
    );
  }

  // 期限切れかどうかをチェック
  const isExpired = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  // 期限が近いかどうかをチェック
  const isNearDeadline = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    return due <= threeDaysFromNow && due >= now;
  };

  return (
    <TaskDetailClient
      task={task}
      isExpired={isExpired(task.dueDate)}
      isNearDeadline={isNearDeadline(task.dueDate)}
    />
  );
}
