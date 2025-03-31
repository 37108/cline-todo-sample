"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TASK_PRIORITY } from "@/config";
import type { TaskWithClientData } from "@/features/tasks/hooks/use-tasks";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Clock, Tag, Trash2 } from "lucide-react";
import Link from "next/link";

// 優先度に応じたラベルとスタイル
const PRIORITY_LABELS: Record<string, { label: string; className: string }> = {
  [TASK_PRIORITY.LOW]: { label: "低", className: "bg-blue-100 text-blue-800" },
  [TASK_PRIORITY.MEDIUM]: { label: "中", className: "bg-yellow-100 text-yellow-800" },
  [TASK_PRIORITY.HIGH]: { label: "高", className: "bg-orange-100 text-orange-800" },
  [TASK_PRIORITY.URGENT]: { label: "緊急", className: "bg-red-100 text-red-800" },
};

interface TaskCardProps {
  task: TaskWithClientData;
  index: number;
  onDelete: (id: string) => Promise<boolean>;
}

export function TaskCard({ task, index, onDelete }: TaskCardProps) {
  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // タスクの削除
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("このタスクを削除してもよろしいですか？")) {
      await onDelete(task.id);
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
        >
          <Link href={`/tasks/${task.id}`} className="block">
            <Card
              className={`
                transition-shadow hover:shadow-md
                ${task.isExpired ? "border-red-300" : ""}
                ${task.isNearDeadline && !task.isExpired ? "border-yellow-300" : ""}
              `}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                {task.details && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{task.details}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {task.priority && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        PRIORITY_LABELS[task.priority]?.className ?? ""
                      }`}
                    >
                      {PRIORITY_LABELS[task.priority]?.label ?? task.priority}
                    </span>
                  )}
                  {task.tags &&
                    task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                </div>
              </CardContent>
              {task.dueDate && (
                <CardFooter className="pt-0">
                  <div
                    className={`flex items-center text-xs ${
                      task.isExpired
                        ? "text-red-600"
                        : task.isNearDeadline
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {task.isExpired ? (
                      <Clock className="mr-1 h-3 w-3" />
                    ) : (
                      <Calendar className="mr-1 h-3 w-3" />
                    )}
                    {formatDate(task.dueDate)}
                    {task.isExpired && <span className="ml-1">（期限切れ）</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">削除</span>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
