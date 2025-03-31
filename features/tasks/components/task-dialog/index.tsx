"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TASK_PRIORITY, TASK_STATUS } from "@/config";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import type { Task } from "@/features/tasks/models/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// フォームのスキーマ
const formSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  details: z.string().max(1000, "詳細は1000文字以内で入力してください").optional(),
  dueDate: z.date().optional(),
  status: z.enum([
    TASK_STATUS.PENDING,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.COMPLETED,
    TASK_STATUS.CANCELLED,
  ]),
  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT])
    .optional(),
  tagsInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onTaskCreated?: () => void;
}

export function TaskDialog({ open, onOpenChange, task, onTaskCreated }: TaskDialogProps) {
  const { createTask, updateTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 編集モードかどうか
  const isEditMode = !!task;

  // フォームの初期化
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      details: task?.details || "",
      status: task?.status || TASK_STATUS.PENDING,
      priority: task?.priority,
      tagsInput: task?.tags ? task.tags.join(", ") : "",
    },
  });

  // 日付の初期化
  useEffect(() => {
    if (task?.dueDate) {
      form.setValue("dueDate", new Date(task.dueDate));
    }
  }, [task, form]);

  // フォームの送信処理
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // 必要なプロパティだけを選択して新しいオブジェクトを作成
      const { tagsInput, ...rest } = values;

      // 日付をISO文字列に変換し、タグを配列に変換
      const taskData = {
        ...rest,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        tags: tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : undefined,
      };

      if (isEditMode && task) {
        // 既存タスクの更新
        await updateTask(task.id, taskData);
      } else {
        // 新規タスクの作成
        await createTask(taskData);
      }

      // 成功時の処理
      if (onTaskCreated) {
        onTaskCreated();
      }

      form.reset(); // フォームをリセット
      onOpenChange(false); // ダイアログを閉じる
    } catch (error) {
      console.error(`タスクの${isEditMode ? "更新" : "作成"}に失敗しましたわ`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "タスクの編集" : "新規タスク"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "タスクの詳細を編集してくださいませ。"
              : "新しいタスクの詳細を入力してくださいませ。"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="タスクのタイトル" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 詳細 */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>詳細</FormLabel>
                  <FormControl>
                    <Textarea placeholder="タスクの詳細" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 期限 */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>期限</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ja })
                          ) : (
                            <span>日付を選択</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>タスクの期限を設定します</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ステータス */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ステータス</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TASK_STATUS.PENDING}>未着手</SelectItem>
                      <SelectItem value={TASK_STATUS.IN_PROGRESS}>進行中</SelectItem>
                      <SelectItem value={TASK_STATUS.COMPLETED}>完了</SelectItem>
                      <SelectItem value={TASK_STATUS.CANCELLED}>キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 優先度 */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>優先度</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="優先度を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TASK_PRIORITY.LOW}>低</SelectItem>
                      <SelectItem value={TASK_PRIORITY.MEDIUM}>中</SelectItem>
                      <SelectItem value={TASK_PRIORITY.HIGH}>高</SelectItem>
                      <SelectItem value={TASK_PRIORITY.URGENT}>緊急</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* タグ */}
            <FormField
              control={form.control}
              name="tagsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タグ</FormLabel>
                  <FormControl>
                    <Input placeholder="タグ（カンマ区切り）" {...field} />
                  </FormControl>
                  <FormDescription>
                    複数のタグはカンマで区切って入力してくださいませ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? "更新中..."
                    : "作成中..."
                  : isEditMode
                    ? "更新"
                    : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
