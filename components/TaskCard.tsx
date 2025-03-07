"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TaskWithClientData } from "@/lib/hooks/useTasks";
import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AlertCircle, Calendar, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TaskCardProps {
  task: TaskWithClientData;
  index: number;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, index, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  // ステータスに応じたバッジの色を設定
  const getStatusBadgeVariant = () => {
    switch (task.status) {
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
  const getPriorityBadgeVariant = () => {
    switch (task.priority) {
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

  // ステータスの日本語表示
  const getStatusText = () => {
    switch (task.status) {
      case "pending":
        return "未着手";
      case "in_progress":
        return "進行中";
      case "completed":
        return "完了";
      case "cancelled":
        return "キャンセル";
      default:
        return task.status;
    }
  };

  // 優先度の日本語表示
  const getPriorityText = () => {
    switch (task.priority) {
      case "urgent":
        return "緊急";
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "";
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
        >
          <Link href={`/tasks/${task.id}`} className="block">
            <Card
              className={`
              transition-all duration-200
              ${snapshot.isDragging ? "shadow-lg" : ""}
              ${task.isExpired ? "border-red-500 dark:border-red-700" : ""}
              ${task.isNearDeadline ? "border-amber-500 dark:border-amber-700" : ""}
            `}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium line-clamp-2">{task.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-2">
                {task.details && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.details}</p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-wrap gap-2 items-center">
                <Badge variant={getStatusBadgeVariant()}>{getStatusText()}</Badge>

                {task.priority && (
                  <Badge variant={getPriorityBadgeVariant()}>{getPriorityText()}</Badge>
                )}

                {task.dueDate && (
                  <div className="flex items-center ml-auto text-xs text-muted-foreground">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), "MM/dd", { locale: ja })}
                            {task.isExpired && (
                              <AlertCircle className="h-3 w-3 ml-1 text-destructive" />
                            )}
                            {task.isNearDeadline && !task.isExpired && (
                              <Clock className="h-3 w-3 ml-1 text-amber-500" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {task.isExpired
                            ? "期限切れです！"
                            : task.isNearDeadline
                              ? "期限が近づいています"
                              : ""}
                          <br />
                          {format(new Date(task.dueDate), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className="w-full mt-2 flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge key={`tag-${task.id}-${tag}`} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
