import { UpdateTaskInput } from "@/features/tasks/models/schema";
import { taskRepository } from "@/features/tasks/repositories/task-repository";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// GET /api/tasks/[id] - 特定のタスクを取得
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const result = await taskRepository.findById(id);

  if (result.isErr()) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  if (!result.value) {
    return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(result.value);
}

// PUT /api/tasks/[id] - タスクを更新
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 入力値のバリデーション
    const validatedInput = UpdateTaskInput.parse(body);

    const result = await taskRepository.update(id, validatedInput);

    if (result.isErr()) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!result.value) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "入力値が不正です", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "タスクの更新に失敗しました" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - タスクを削除
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const result = await taskRepository.delete(id);

  if (result.isErr()) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  if (!result.value) {
    return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
