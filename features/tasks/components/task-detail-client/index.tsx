"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskDialog } from "@/features/tasks/components/task-dialog";
import type { Task } from "@/features/tasks/models/schema";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AlertCircle, ArrowLeft, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TaskDetailClientProps {
  task: Task;
  isExpired: boolean;
  isNearDeadline: boolean;
}

export function TaskDetailClient({ task, isExpired, isNearDeadline }: TaskDetailClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  // タスクの削除
  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("タスクの削除に失敗しましたわ");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "タスクの削除に失敗しましたわ");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      <Card
        className={`
        ${isExpired ? "border-red-500 dark:border-red-700" : ""}
        ${isNearDeadline && !isExpired ? "border-amber-500 dark:border-amber-700" : ""}
      `}
      >
        <CardHeader>
          <CardTitle className="font-bold text-2xl">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.details && (
            <div>
              <h3 className="mb-1 font-medium text-muted-foreground text-sm">詳細</h3>
              <p className="whitespace-pre-wrap">{task.details}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
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
                  {isExpired && <AlertCircle className="ml-1 h-4 w-4 text-destructive" />}
                  {isNearDeadline && !isExpired && (
                    <Clock className="ml-1 h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
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
        </CardFooter>
      </Card>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={task}
        onTaskCreated={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
