"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { validateTaskTitle, type Task } from "./task";

type TaskFormProps = {
  onAddTask: (task: Omit<Task, "id" | "is_done">) => Promise<boolean>;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const monthFormatter = new Intl.DateTimeFormat("vi-VN", { month: "long" });
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function DatePickerDialog({
  value,
  onCancel,
  onConfirm,
}: {
  value: Date;
  onCancel: () => void;
  onConfirm: (value: Date) => void;
}) {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const dialogTitleId = "date-picker-title";
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, index) => currentYear - 10 + index);
  const selectedDate =
    value.getFullYear() === year && value.getMonth() === month ? value.getDate() : null;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function changeMonth(offset: number) {
    setVisibleMonth(new Date(year, month + offset, 1));
  }

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)]">
      <section
        aria-labelledby={dialogTitleId}
        className="rounded-xl border border-border bg-white p-3 shadow-xl"
        role="dialog"
      >
        <h2 className="sr-only" id={dialogTitleId}>Chọn ngày tháng năm</h2>
        <div className="flex items-center justify-between gap-1">
          <button
            aria-label="Tháng trước"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-[#e0faeb] hover:text-primary"
            onClick={() => changeMonth(-1)}
            type="button"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
            <label className="sr-only" htmlFor="task-date-month">Tháng</label>
            <select
              className="min-w-0 rounded-lg border border-border bg-white px-2 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              id="task-date-month"
              onChange={(event) => setVisibleMonth(new Date(year, Number(event.target.value), 1))}
              value={month}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {monthFormatter.format(new Date(year, index, 1))}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="task-date-year">Năm</label>
            <select
              className="rounded-lg border border-border bg-white px-2 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              id="task-date-year"
              onChange={(event) => setVisibleMonth(new Date(Number(event.target.value), month, 1))}
              value={year}
            >
              {years.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <button
            aria-label="Tháng sau"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-[#e0faeb] hover:text-primary"
            onClick={() => changeMonth(1)}
            type="button"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
          {weekdays.map((day) => <span className="py-1" key={day}>{day}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span aria-hidden="true" className="h-8 w-8" key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const isSelected = selectedDate === day;

            return (
              <button
                aria-label={dateFormatter.format(new Date(year, month, day))}
                aria-pressed={isSelected}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                  isSelected
                    ? "bg-primary font-semibold text-white"
                    : "text-foreground hover:bg-[#e0faeb] hover:text-primary"
                }`}
                key={day}
                onClick={() => onConfirm(new Date(year, month, day))}
                type="button"
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TimePickerDialog({
  value,
  onCancel,
  onConfirm,
}: {
  value: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}) {
  const [hour, setHour] = useState(Number(value.slice(0, 2)));
  const [minute, setMinute] = useState(Number(value.slice(3, 5)));
  const dialogTitleId = "time-picker-title";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hour, minute, onCancel]);

  const formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 w-full">
      <section
        aria-labelledby={dialogTitleId}
        className="w-full rounded-xl border border-border bg-white p-2.5 shadow-xl"
        role="dialog"
      >
        <h2 className="sr-only" id={dialogTitleId}>Chọn thời gian</h2>
        <div className="flex items-center justify-center gap-1.5">
          <div className="flex min-w-0 flex-1 flex-col items-center rounded-lg bg-[#f0fdf4] p-1">
            <button
              aria-label="Tăng giờ"
              className="flex h-7 w-full items-center justify-center rounded-md text-muted hover:bg-primary hover:text-white"
              onClick={() => setHour((current) => (current + 1) % 24)}
              type="button"
            >
              <span aria-hidden="true">▲</span>
            </button>
            <output aria-label="Giờ" className="font-display py-1 text-lg font-bold tabular-nums text-primary">
              {String(hour).padStart(2, "0")}
            </output>
            <button
              aria-label="Giảm giờ"
              className="flex h-7 w-full items-center justify-center rounded-md text-muted hover:bg-primary hover:text-white"
              onClick={() => setHour((current) => (current + 23) % 24)}
              type="button"
            >
              <span aria-hidden="true">▼</span>
            </button>
          </div>
          <span aria-hidden="true" className="font-display text-lg font-bold text-primary">:</span>
          <div className="flex min-w-0 flex-1 flex-col items-center rounded-lg bg-[#f0fdf4] p-1">
            <button
              aria-label="Tăng phút"
              className="flex h-7 w-full items-center justify-center rounded-md text-muted hover:bg-primary hover:text-white"
              onClick={() => setMinute((current) => (current + 1) % 60)}
              type="button"
            >
              <span aria-hidden="true">▲</span>
            </button>
            <output aria-label="Phút" className="font-display py-1 text-lg font-bold tabular-nums text-primary">
              {String(minute).padStart(2, "0")}
            </output>
            <button
              aria-label="Giảm phút"
              className="flex h-7 w-full items-center justify-center rounded-md text-muted hover:bg-primary hover:text-white"
              onClick={() => setMinute((current) => (current + 59) % 60)}
              type="button"
            >
              <span aria-hidden="true">▼</span>
            </button>
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <button
            className="min-h-9 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-[#f0fdf4]"
            onClick={onCancel}
            type="button"
          >
            Hủy
          </button>
          <button
            className="min-h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-white transition hover:bg-primary-hover"
            onClick={() => onConfirm(formattedTime)}
            type="button"
          >
            OK
          </button>
        </div>
      </section>
    </div>
  );
}

export function TaskForm({ onAddTask, onCancel, isSubmitting = false }: TaskFormProps) {
  const isDialog = Boolean(onCancel);
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [deadline, setDeadline] = useState("17:30");
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || isSubmitting) return;
    const trimmedTitle = title.trim();

    const titleError = validateTaskTitle(title);
    if (titleError) {
      setError(titleError);
      return;
    }

    setIsSaving(true);
    try {
      const [hour, minute] = deadline.split(":").map(Number);
      const dueAt = new Date(selectedDate);
      dueAt.setHours(hour, minute, 0, 0);
      const saved = await onAddTask({
        title: trimmedTitle,
        due_at: dueAt.toISOString(),
      });
      if (saved) {
        setTitle("");
        setError(null);
        onCancel?.();
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="new-task-title">
        Tên công việc
      </label>
      <div>
        <input
          aria-describedby={error ? "new-task-title-error" : undefined}
          aria-invalid={Boolean(error)}
          autoFocus={Boolean(onCancel)}
          className={`h-12 w-full rounded-xl border bg-[#e0faeb]/70 px-4 text-sm placeholder:text-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 ${
            error
              ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/15"
              : "border-transparent focus:border-primary"
          }`}
          id="new-task-title"
          onChange={(event) => {
            setTitle(event.target.value);
            if (error) setError(validateTaskTitle(event.target.value));
          }}
          placeholder="Nhập tên công việc, bài tập hoặc chương cần ôn tập..."
          value={title}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[#dc2626]" id="new-task-title-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div
        className={
          isDialog
            ? "grid grid-cols-2 items-center gap-3"
            : "flex flex-col gap-3 md:grid md:grid-cols-3 md:items-center"
        }
      >
        <label className="sr-only" htmlFor="new-task-date">
          Ngày thực hiện
        </label>
        <div className="relative w-full min-w-0">
          <button
            aria-expanded={isDatePickerOpen}
            aria-haspopup="dialog"
            aria-label={`Chọn ngày, hiện tại ${dateFormatter.format(selectedDate)}`}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-[#e0faeb] px-3 text-left text-sm text-foreground transition-colors hover:bg-[#d5eedf] focus:outline-none focus:ring-2 focus:ring-primary/20"
            id="new-task-date"
            onClick={() => setIsDatePickerOpen((current) => !current)}
            type="button"
          >
            <span className="truncate">{dateFormatter.format(selectedDate)}</span>
            <svg
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-muted transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </button>
          {isDatePickerOpen && (
            <DatePickerDialog
              onCancel={() => setIsDatePickerOpen(false)}
              onConfirm={(value) => {
                setSelectedDate(value);
                setIsDatePickerOpen(false);
              }}
              value={selectedDate}
            />
          )}
        </div>
        <div className="relative w-full min-w-0">
          <button
            aria-haspopup="dialog"
            aria-expanded={isTimePickerOpen}
            aria-label={`Chọn thời gian, hiện tại ${deadline}`}
            className="h-10 w-full min-w-0 rounded-lg border border-transparent bg-[#e0faeb] px-3 text-left text-sm text-foreground transition-colors hover:bg-[#d5eedf] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            onClick={() => setIsTimePickerOpen((current) => !current)}
            type="button"
          >
            {deadline}
          </button>
          {isTimePickerOpen && (
            <TimePickerDialog
              onCancel={() => setIsTimePickerOpen(false)}
              onConfirm={(value) => {
                setDeadline(value);
                setIsTimePickerOpen(false);
              }}
              value={deadline}
            />
          )}
        </div>
        <button
          className={`flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
            isDialog ? "col-span-2 w-full" : "w-full"
          }`}
          disabled={isSaving || isSubmitting}
          type="submit"
        >
          <Icon name="plus" className="h-5 w-5" />
          {isSaving || isSubmitting ? "Đang thêm..." : "Thêm công việc"}
        </button>
      </div>
    </form>
  );
}
