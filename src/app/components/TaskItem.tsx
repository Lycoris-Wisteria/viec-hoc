"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { validateTaskTitle, type Task } from "./task";

const deadlineFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, title: string) => Promise<boolean>;
  isPending: boolean;
};

function DeleteConfirmationDialog({
  taskTitle,
  onCancel,
  onConfirm,
}: {
  taskTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2a1d]/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        aria-labelledby="delete-task-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-border bg-white p-5 shadow-2xl sm:p-6"
        role="alertdialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground" id="delete-task-title">
              Xóa công việc?
            </h2>
            <p className="mt-2 break-words text-sm leading-6 text-muted">
              Bạn có chắc muốn xóa “{taskTitle}” không? Thao tác này không thể hoàn tác.
            </p>
          </div>
          <button
            aria-label="Đóng hộp thoại"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-[#f0fdf4] hover:text-foreground"
            onClick={onCancel}
            type="button"
          >
            <span aria-hidden="true" className="text-2xl leading-none">×</span>
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            autoFocus
            className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-[#f0fdf4]"
            onClick={onCancel}
            type="button"
          >
            Hủy
          </button>
          <button
            className="min-h-11 rounded-xl bg-[#dc2626] px-4 text-sm font-semibold text-white transition hover:bg-[#b91c1c]"
            onClick={onConfirm}
            type="button"
          >
            Xóa công việc
          </button>
        </div>
      </section>
    </div>
  );
}

export function TaskItem({ task, onToggle, onDelete, onEdit, isPending }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [error, setError] = useState<string | null>(null);

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const trimmedTitle = title.trim();
    const titleError = validateTaskTitle(title);

    if (titleError) {
      setError(titleError);
      return;
    }

    if (await onEdit(task.id, trimmedTitle)) {
      setEditing(false);
      setError(null);
    }
  }

  return (
    <article
      data-testid="task-item"
      className={`group flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:shadow-sm ${
        task.is_done ? "bg-[#e8f9ef]" : ""
      }`}
    >
      <button
        aria-label={task.is_done ? `Đánh dấu chưa xong: ${task.title}` : `Đánh dấu hoàn thành: ${task.title}`}
        aria-pressed={task.is_done}
        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        disabled={isPending}
        onClick={() => onToggle(task.id)}
        type="button"
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
            task.is_done
              ? "border-primary bg-primary text-white"
              : "border-border bg-[#e0faeb] text-transparent group-hover:border-primary group-hover:text-primary"
          }`}
        >
          <Icon name="check" className="h-3.5 w-3.5" />
        </span>
      </button>

      <div className="min-w-0 flex-1 pt-0.5">
        {editing ? (
          <form className="flex flex-wrap gap-2" onSubmit={handleEdit}>
            <label className="sr-only" htmlFor={`edit-${task.id}`}>
              Chỉnh sửa công việc
            </label>
            <input
              aria-describedby={error ? `edit-${task.id}-error` : undefined}
              aria-invalid={Boolean(error)}
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              disabled={isPending}
              id={`edit-${task.id}`}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError(validateTaskTitle(event.target.value));
              }}
              value={title}
            />
            <button className="min-h-11 min-w-11 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-[#e0faeb] disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">
              {isPending ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              className="min-h-11 min-w-11 rounded-lg px-2 text-sm text-muted hover:bg-[#f0fdf4]"
              disabled={isPending}
              onClick={() => {
                setTitle(task.title);
                setEditing(false);
                setError(null);
              }}
              type="button"
            >
              Hủy
            </button>
            {error && (
              <p className="basis-full text-sm text-[#dc2626]" id={`edit-${task.id}-error`} role="alert">
                {error}
              </p>
            )}
          </form>
        ) : (
          <>
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold text-[#006438]">
                {task.subject && <span>{task.subject}</span>}
                {task.urgent && !task.is_done && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ffdad6] px-2 py-0.5 font-semibold text-[#b42318]">
                    <Icon name="clock" className="h-3 w-3" />
                    Gấp
                  </span>
                )}
              </div>
            </div>
            <p
              className={`mt-1 text-[18px] font-bold leading-snug ${
                task.is_done ? "text-primary line-through" : "text-primary"
              }`}
            >
              {task.title}
            </p>
            {(task.due_at || task.deadline) && (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted">
                {task.due_at ? (
                  <>
                    <time dateTime={task.due_at}>
                      {deadlineFormatter.format(new Date(task.due_at))}
                    </time>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#006438]" />
                    <time dateTime={task.due_at}>
                      {timeFormatter.format(new Date(task.due_at))}
                    </time>
                  </>
                ) : (
                  <span>{task.deadline?.replace("Hôm nay, ", "")}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!editing && (
        <div className="-mr-2 flex shrink-0 items-center">
          <button
            aria-label={`Chỉnh sửa: ${task.title}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-[#e0faeb] hover:text-foreground"
            disabled={isPending}
            onClick={() => {
              setTitle(task.title);
              setEditing(true);
            }}
            type="button"
          >
            <Icon name="edit" className="h-[18px] w-[18px]" />
          </button>
          <button
            aria-label={`Xóa: ${task.title}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-[#ffdad6] hover:text-[#b42318]"
            disabled={isPending}
            onClick={() => setConfirmingDelete(true)}
            type="button"
          >
            <Icon name="trash" className="h-[18px] w-[18px]" />
          </button>
        </div>
      )}
      {confirmingDelete && (
        <DeleteConfirmationDialog
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            onDelete(task.id);
          }}
          taskTitle={task.title}
        />
      )}
    </article>
  );
}
