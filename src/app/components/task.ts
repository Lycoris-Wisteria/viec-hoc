export type Task = {
  id: string;
  title: string;
  is_done: boolean;
  subject?: string;
  deadline?: string;
  urgent?: boolean;
};

export type TaskFilter = "all" | "pending" | "completed";

export function validateTaskTitle(title: string): string | null {
  const trimmedTitle = title.trim();
  const characterCount = Array.from(trimmedTitle).length;

  if (characterCount < 1) {
    return "Vui lòng nhập tên công việc.";
  }

  if (characterCount > 120) {
    return "Tên công việc không được vượt quá 120 ký tự.";
  }

  return null;
}
