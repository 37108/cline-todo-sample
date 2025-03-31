"use server";

import { CreateTaskInput, UpdateTaskInput } from "@/lib/domains/task/schema";
import { taskRepository } from "@/lib/repositories/taskRepository";
import { type Result, err, ok } from "neverthrow";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// タスク作成アクション
export async function createTask(
  formData: FormData,
): Promise<Result<{ success: boolean; id?: string }, { message: string; errors?: z.ZodError }>> {
  try {
    // FormDataからオブジェクトに変換
    const rawData = {
      title: formData.get("title") as string,
      details: formData.get("details") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate") as string,
      tags: formData.get("tags") as string,
    };

    // タグの処理
    const tags = rawData.tags
      ? rawData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    // 日付の処理
    const dueDate = rawData.dueDate ? new Date(rawData.dueDate).toISOString() : undefined;

    // 優先度の処理（空文字列の場合はundefined）
    const priority = rawData.priority && rawData.priority.length > 0 ? rawData.priority : undefined;

    // 入力データの作成
    const taskData = {
      title: rawData.title,
      details: rawData.details || undefined,
      status: rawData.status,
      priority,
      dueDate,
      tags,
    };

    // バリデーション
    const validatedData = CreateTaskInput.parse(taskData);

    // リポジトリを使用してタスクを作成
    const result = await taskRepository.create(validatedData);

    if (result.isErr()) {
      return err({ message: `タスクの作成に失敗しましたわ: ${result.error.message}` });
    }

    // キャッシュの再検証
    revalidateTag("/tasks");

    return ok({ success: true, id: result.value.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return err({ message: "入力値が不正ですわ", errors: error });
    }
    return err({
      message: `タスクの作成に失敗しましたわ: ${error instanceof Error ? error.message : "不明なエラー"}`,
    });
  }
}

// タスク更新アクション
export async function updateTask(
  id: string,
  formData: FormData,
): Promise<Result<{ success: boolean }, { message: string; errors?: z.ZodError }>> {
  try {
    // FormDataからオブジェクトに変換
    const rawData = {
      title: formData.get("title") as string,
      details: formData.get("details") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate") as string,
      tags: formData.get("tags") as string,
    };

    // タグの処理
    const tags = rawData.tags
      ? rawData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    // 日付の処理
    const dueDate = rawData.dueDate ? new Date(rawData.dueDate).toISOString() : undefined;

    // 優先度の処理（空文字列の場合はundefined）
    const priority = rawData.priority && rawData.priority.length > 0 ? rawData.priority : undefined;

    // 入力データの作成
    const taskData = {
      title: rawData.title,
      details: rawData.details || undefined,
      status: rawData.status,
      priority,
      dueDate,
      tags,
    };

    // バリデーション
    const validatedData = UpdateTaskInput.parse(taskData);

    // リポジトリを使用してタスクを更新
    const result = await taskRepository.update(id, validatedData);

    if (result.isErr()) {
      return err({ message: `タスクの更新に失敗しましたわ: ${result.error.message}` });
    }

    if (!result.value) {
      return err({ message: "タスクが見つかりませんわ" });
    }

    // キャッシュの再検証
    revalidateTag("/tasks");
    revalidateTag(`/tasks/${id}`);

    return ok({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return err({ message: "入力値が不正ですわ", errors: error });
    }
    return err({
      message: `タスクの更新に失敗しましたわ: ${error instanceof Error ? error.message : "不明なエラー"}`,
    });
  }
}

// タスク削除アクション
export async function deleteTask(
  id: string,
): Promise<Result<{ success: boolean }, { message: string }>> {
  try {
    const result = await taskRepository.delete(id);

    if (result.isErr()) {
      return err({ message: `タスクの削除に失敗しましたわ: ${result.error.message}` });
    }

    if (!result.value) {
      return err({ message: "タスクが見つかりませんわ" });
    }

    // キャッシュの再検証
    revalidateTag("/tasks");

    return ok({ success: true });
  } catch (error) {
    return err({
      message: `タスクの削除に失敗しましたわ: ${error instanceof Error ? error.message : "不明なエラー"}`,
    });
  }
}
