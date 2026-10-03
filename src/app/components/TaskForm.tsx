"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { validateTaskTitle, type Task } from "./task";

type TaskFormProps = {
  onAddTask: (task: Omit<Task, "id" | "is_done">) => void;
  onCancel?: () => void;
};

const subjects = [
  "Toán cao cấp",
  "Đồ án tốt nghiệp",
  "Tiếng Anh IELTS",
  "Kinh tế vĩ mô",
  "Lập trình Web",
];

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

export function TaskForm({ onAddTask, onCancel }: TaskFormProps) {
  const isDialog = Boolean(onCancel);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [deadline, setDeadline] = useState("17:30");
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubjectKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setIsSubjectOpen(true);
      setActiveSubjectIndex((current) => (current + direction + subjects.length) % subjects.length);
    } else if (event.key === "Enter" && isSubjectOpen) {
      event.preventDefault();
      setSubject(subjects[activeSubjectIndex]);
      setIsSubjectOpen(false);
    } else if (event.key === "Escape") {
      setIsSubjectOpen(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    const titleError = validateTaskTitle(title);
    if (titleError) {
      setError(titleError);
      return;
    }

    onAddTask({
      title: trimmedTitle,
      subject,
      deadline: `Hôm nay, ${deadline}`,
    });
    setTitle("");
    setError(null);
    onCancel?.();
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
        <label className="sr-only" htmlFor="new-task-subject">
          Môn học
        </label>
        <div className="relative w-full min-w-0">
          <button
            aria-activedescendant={isSubjectOpen ? `subject-option-${activeSubjectIndex}` : undefined}
            aria-controls="new-task-subject-options"
            aria-expanded={isSubjectOpen}
            aria-haspopup="listbox"
            aria-label="Môn học"
            className="flex h-10 w-full items-center justify-between rounded-lg bg-[#e0faeb] py-2 pl-3 pr-3 text-left text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            id="new-task-subject"
            onClick={() => {
              const selectedIndex = subjects.indexOf(subject);
              setActiveSubjectIndex(selectedIndex >= 0 ? selectedIndex : 0);
              setIsSubjectOpen((current) => !current);
            }}
            onKeyDown={handleSubjectKeyDown}
            role="combobox"
            type="button"
          >
            {subject}
            <svg
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-muted transition-transform ${isSubjectOpen ? "rotate-180" : ""}`}
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
          {isSubjectOpen && (
            <ul
              aria-labelledby="new-task-subject"
              className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-lg"
              id="new-task-subject-options"
              role="listbox"
            >
              {subjects.map((item, index) => (
                <li key={item} role="presentation">
                  <button
                    aria-selected={subject === item}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary hover:text-white ${
                      activeSubjectIndex === index ? "bg-primary text-white" : "text-foreground"
                    }`}
                    id={`subject-option-${index}`}
                    onClick={() => {
                      setSubject(item);
                      setActiveSubjectIndex(index);
                      setIsSubjectOpen(false);
                    }}
                    onMouseEnter={() => setActiveSubjectIndex(index)}
                    role="option"
                    type="button"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
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
          className={`flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.98] ${
            isDialog ? "col-span-2 w-full" : "w-full"
          }`}
          type="submit"
        >
          <Icon name="plus" className="h-5 w-5" />
          Thêm công việc
        </button>
      </div>
    </form>
  );
}
