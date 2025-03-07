"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/lib/domains/task/schema";
import { useTasks } from "@/lib/hooks/useTasks";
import { format } from "date-fns";
import { useState } from "react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const { createTask, updateTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // フォームデータの型定義
  interface FormData {
    title: string;
    details?: string;
    status: Task["status"];
    priority?: Task["priority"] | "";
    dueDate?: string;
    tags?: string[];
  }

  // フォームの初期値を設定
  const [formData, setFormData] = useState<FormData>({
    title: task?.title || "",
    details: task?.details || "",
    status: task?.status || "pending",
    priority: task?.priority || "",
    dueDate: task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
    tags: task?.tags || [],
  });

  // フォームの入力値を更新
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // タグの入力処理
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
  };

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title) {
      setFormError("タイトルは必須です");
      return;
    }

    try {
      setIsSubmitting(true);

      // データの処理
      const processedData: Partial<Task> = {
        title: formData.title,
        status: formData.status,
      };

      // 詳細の処理
      if (formData.details) {
        processedData.details = formData.details;
      }

      // 日付の処理
      if (formData.dueDate) {
        processedData.dueDate = new Date(formData.dueDate).toISOString();
      }

      // 優先度の処理
      if (formData.priority) {
        // 空文字列でないかチェック
        if (formData.priority.length > 0) {
          // 型アサーションを使用して、空文字列でない場合は有効な優先度として設定
          processedData.priority = formData.priority as Task["priority"];
        }
      }

      // タグの処理
      if (formData.tags && formData.tags.length > 0) {
        processedData.tags = formData.tags;
      }

      if (task?.id) {
        // 更新
        await updateTask(task.id, processedData);
      } else {
        // 新規作成
        await createTask(processedData as Omit<Task, "id">);
      }

      onOpenChange(false);
      setFormData({
        title: "",
        details: "",
        status: "pending",
        priority: undefined,
        dueDate: "",
        tags: [],
      });
    } catch (error) {
      setFormError("タスクの保存に失敗しました");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "タスクを編集" : "新規タスク"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="font-medium text-destructive text-sm">{formError}</div>}

          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="タスクのタイトル"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">詳細</Label>
            <Textarea
              id="details"
              name="details"
              value={formData.details || ""}
              onChange={handleChange}
              placeholder="タスクの詳細"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <select
                id="status"
                name="status"
                value={formData.status || "pending"}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">優先度</Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || ""}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">選択なし</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">緊急</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">期日</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="datetime-local"
              value={formData.dueDate || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">タグ（カンマ区切り）</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags?.join(", ") || ""}
              onChange={handleTagsChange}
              placeholder="仕事, 個人, 重要"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : task ? "更新" : "作成"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
