import { TaskBoard } from "@/components/TaskBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ToDo アプリ",
  description: "タスク管理のための ToDo アプリ",
};

export default function Home() {
  return <TaskBoard />;
}
