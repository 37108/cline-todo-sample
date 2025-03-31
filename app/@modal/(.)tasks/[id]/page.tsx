"use client";

import { TaskDialog } from "@/components/TaskDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Task } from "@/lib/domains/task/schema";
import { useTasks } from "@/lib/hooks/useTasks";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AlertCircle, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function TaskDetailModal({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getTask, deleteTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // モーダルを閉じたときの処理
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.back();
    }
  };
  const id = use(params).id;

  // タスクの取得
  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const taskData = await getTask(id);
        setTask(taskData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "タスクの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id, getTask]);

  // タスクの削除
  const handleDelete = async () => {
    if (isDeleting || !task) return;

    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "タスクの削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  // ステータスの日本語表示
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "未着手";
      case "in_progress":
        return "進行中";
      case "completed":
        return "完了";
      case "cancelled":
        return "キャンセル";
      default:
        return status;
    }
  };

  // 優先度の日本語表示
  const getPriorityText = (priority?: string) => {
    if (!priority) return "";

    switch (priority) {
      case "urgent":
        return "緊急";
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return priority;
    }
  };

  // ステータスに応じたバッジの色を設定
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // 優先度に応じたバッジの色を設定
  const getPriorityBadgeVariant = (priority?: string) => {
    if (!priority) return "outline";

    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>タスク詳細</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !task ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>タスクが見つかりません</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">{task.title}</h2>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
                  <Edit className="mr-1 h-4 w-4" />
                  編集
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  削除
                </Button>
              </div>
            </div>

            {task.details && (
              <div>
                <h3 className="mb-1 font-medium text-muted-foreground text-sm">詳細</h3>
                <p className="whitespace-pre-wrap">{task.details}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="mb-1 font-medium text-muted-foreground text-sm">ステータス</h3>
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {getStatusText(task.status)}
                </Badge>
              </div>

              {task.priority && (
                <div>
                  <h3 className="mb-1 font-medium text-muted-foreground text-sm">優先度</h3>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>
                    {getPriorityText(task.priority)}
                  </Badge>
                </div>
              )}

              {task.dueDate && (
                <div>
                  <h3 className="mb-1 font-medium text-muted-foreground text-sm">期日</h3>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>
                      {format(new Date(task.dueDate), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                    </span>
                    {isExpired(task.dueDate) && (
                      <AlertCircle className="ml-1 h-4 w-4 text-destructive" />
                    )}
                    {isNearDeadline(task.dueDate) && !isExpired(task.dueDate) && (
                      <Clock className="ml-1 h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className="mb-1 font-medium text-muted-foreground text-sm">タグ</h3>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <Badge key={`tag-${task.id}-${tag}`} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {task && <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} task={task} />}
      </DialogContent>
    </Dialog>
  );
}
