import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateTaskInput } from "../../../lib/domains/task/schema";
import { taskRepository } from "../../../lib/repositories/taskRepository";

// GET /api/tasks - すべてのタスクを取得
export async function GET() {
  const result = await taskRepository.findAll();

  if (result.isErr()) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.value);
}

// POST /api/tasks - 新しいタスクを作成
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 入力値のバリデーション
    const validatedInput = CreateTaskInput.parse(body);

    const result = await taskRepository.create(validatedInput);

    if (result.isErr()) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "入力値が不正です", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "タスクの作成に失敗しました" }, { status: 500 });
  }
}
