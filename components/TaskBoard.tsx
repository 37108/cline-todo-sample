"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { type TaskWithClientData, useTasks } from "@/lib/hooks/useTasks";
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";

const TASK_STATUS_LIST = ["pending", "in_progress", "completed", "cancelled"] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "未着手",
  in_progress: "進行中",
  completed: "完了",
  cancelled: "キャンセル",
};

export function TaskBoard() {
  const { tasks, isLoading, error, updateTask, deleteTask, getTasksByStatus } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 期限切れや期限が近いタスクの数を計算
  const expiredTasks = tasks.filter((task) => task.isExpired);
  const nearDeadlineTasks = tasks.filter((task) => task.isNearDeadline && !task.isExpired);

  // ドラッグ&ドロップの処理
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // ドロップ先がない場合は何もしない
    if (!destination) return;

    // 同じ場所にドロップした場合は何もしない
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // ステータスの更新
    const newStatus = destination.droppableId as (typeof TASK_STATUS_LIST)[number];
    if (TASK_STATUS_LIST.includes(newStatus)) {
      updateTask(draggableId, { status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* 警告通知 */}
      {(expiredTasks.length > 0 || nearDeadlineTasks.length > 0) && (
        <div className="space-y-3">
          {expiredTasks.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>期限切れのタスクがあります</AlertTitle>
              <AlertDescription>
                {expiredTasks.length}件のタスクが期限切れです。確認してください。
              </AlertDescription>
            </Alert>
          )}

          {nearDeadlineTasks.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>期限が近いタスクがあります</AlertTitle>
              <AlertDescription>
                {nearDeadlineTasks.length}件のタスクの期限が3日以内に迫っています。
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* 新規タスク作成ボタン */}
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規タスク
        </Button>
      </div>

      {/* タスク作成ダイアログ */}
      <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ローディング表示 */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
        </div>
      ) : (
        /* タスクボード */
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TASK_STATUS_LIST.map((status) => {
              const statusTasks = getTasksByStatus(status);
              return (
                <div key={status} className="rounded-lg bg-muted/30 p-4">
                  <h3 className="mb-4 flex items-center font-medium">
                    {STATUS_LABELS[status]}
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({statusTasks.length})
                    </span>
                  </h3>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[200px]"
                      >
                        {statusTasks.map((task: TaskWithClientData, index: number) => (
                          <TaskCard key={task.id} task={task} index={index} onDelete={deleteTask} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
