"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import type { Task, TaskFilter } from "./task";

const initialTasks: Task[] = [
  {
    id: "calculus",
    title: "Giải đề thi thử giải tích chương 3 và 4",
    subject: "Toán cao cấp",
    deadline: "Hôm nay, 11:30",
    is_done: false,
  },
  {
    id: "architecture",
    title: "Hoàn thiện sơ đồ kiến trúc hệ thống và luồng dữ liệu",
    subject: "Đồ án tốt nghiệp",
    deadline: "Hôm nay, 16:00",
    urgent: true,
    is_done: false,
  },
  {
    id: "ielts-reading",
    title: "Luyện 2 đề Reading Cambridge IELTS 18",
    subject: "Tiếng Anh IELTS",
    deadline: "Hôm nay, 20:00",
    is_done: false,
  },
  {
    id: "macroeconomics",
    title: "Nộp tóm tắt chính sách tài khóa mở rộng trên LMS",
    subject: "Kinh tế vĩ mô",
    deadline: "Hôm nay, 10:30",
    is_done: true,
  },
  {
    id: "web-video",
    title: "Xem lại video bài giảng Mã trạng thái chuẩn",
    subject: "Toán cao cấp",
    deadline: "Hôm nay, 08:45",
    is_done: true,
  },
  {
    id: "ielts-vocabulary",
    title: "Ôn 30 từ vựng chủ đề Môi trường & Đô thị hóa",
    subject: "Tiếng Anh IELTS",
    deadline: "Hôm nay, 09:15",
    is_done: true,
  },
  {
    id: "project-report",
    title: "Họp trực tuyến với Giảng viên hướng dẫn tiến độ tuần 4",
    subject: "Đồ án tốt nghiệp",
    deadline: "Hôm nay, 10:00",
    is_done: true,
  },
];

function ProgressCard({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter((task) => task.is_done).length;
  const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-primary">
              <Icon name="trending" className="h-5 w-5" />
            </span>
            <h2 className="font-display text-base font-semibold">Tiến độ hôm nay</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            Đã hoàn thành {completed}/{tasks.length} việc
          </p>
          <div
            aria-label={`Tiến độ ${percentage}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percentage}
            className="mt-2 h-1.5 max-w-48 overflow-hidden rounded-full bg-[#dcfce7]"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[#006a61] transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div
          aria-label={`Biểu đồ tiến độ ${percentage}%`}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16"
          role="img"
          style={{
            background: `conic-gradient(#15803d ${percentage}%, #dcfce7 ${percentage}% 100%)`,
          }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-primary sm:h-12 sm:w-12">
            {percentage}%
          </span>
        </div>
      </div>
    </section>
  );
}

function PomodoroCard() {
  const [isFocusing, setIsFocusing] = useState(false);

  return (
    <section className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <Icon name="timer" className="h-4 w-4 text-primary" />
          Pomodoro
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
        </div>
        <p className="font-display mt-1 text-2xl font-bold text-primary">25:00</p>
      </div>
      <button
        aria-pressed={isFocusing}
        className="rounded-xl bg-[#dcfce7] px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-[#c8f5d5]"
        onClick={() => setIsFocusing((current) => !current)}
        type="button"
      >
        {isFocusing ? "Ⅱ Tạm dừng" : "▶ Bắt đầu"}
      </button>
    </section>
  );
}

export function TaskDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"time" | "name">("time");

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    const result = tasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        `${task.title} ${task.subject ?? ""}`.toLocaleLowerCase("vi").includes(normalizedQuery);
      return matchesQuery;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title, "vi");

      const getMinutes = (deadline: string) => {
        const time = deadline?.match(/(\d{1,2}):(\d{2})/);
        return time ? Number(time[1]) * 60 + Number(time[2]) : Number.MAX_SAFE_INTEGER;
      };

      return getMinutes(a.deadline ?? "") - getMinutes(b.deadline ?? "");
    });
  }, [query, sortBy, tasks]);

  function addTask(newTask: Omit<Task, "id" | "is_done">) {
    setTasks((current) => [
      {
        ...newTask,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        is_done: false,
      },
      ...current,
    ]);
    setFilter("pending");
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, is_done: !task.is_done } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function editTask(id: string, title: string) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, title } : task)),
    );
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] pb-24 text-foreground">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[#d1e7d8]/70 bg-[#f0fdf4]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link aria-label="Việc học của tôi - Công việc" className="flex items-center gap-2.5" href="/tasks">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dcfce7] text-primary">
              <Icon name="book" className="h-[18px] w-[18px]" />
            </span>
            <span className="font-display text-lg font-bold text-primary">
              <span className="md:hidden">Việc học</span>
              <span className="hidden md:inline">Việc học của tôi</span>
            </span>
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="hidden items-center gap-1 rounded-xl bg-[#e0faeb] p-1 md:flex"
          >
            <Link className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white" href="/tasks">
              Công việc
            </Link>
            <span className="px-3 py-2 text-xs text-muted">Lịch học</span>
            <span className="px-3 py-2 text-xs text-muted">Thống kê</span>
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-semibold">Mai Linh</span>
              <span className="block text-[11px] text-muted">Sinh viên</span>
            </span>
            <Image
              alt="Ảnh đại diện Mai Linh"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
              height={36}
              src="/images/aesthetic-blue-flower.jpg"
              width={36}
            />
            <Link
              aria-label="Đến trang đăng nhập"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-[#ffdad6]/60 hover:text-[#b42318]"
              href="/login"
              title="Đăng xuất"
            >
              <Icon name="logout" className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 pb-8 pt-20 sm:gap-6 sm:px-6 lg:px-8">
        <div className="hidden flex-wrap items-end justify-between gap-3 md:flex">
          <div>
            <p className="mb-1 text-sm text-muted md:hidden">Thứ Ba, 24 Tháng 10</p>
            <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight sm:text-3xl">
              Chào buổi sáng, Mai Linh!
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-xl bg-[#e0faeb] px-3 py-2 text-xs font-medium text-muted md:flex">
            <Icon name="calendar" className="h-4 w-4 text-primary" />
            Thứ Ba, 24 Tháng 10
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
          <section className="flex min-w-0 flex-col gap-5 lg:col-span-8">
            <div className="hidden flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Icon name="flag" className="h-5 w-5" />
                Thêm mục tiêu hoặc bài tập mới
              </div>
              <TaskForm onAddTask={addTask} />
            </div>

            <div className="lg:hidden">
              <ProgressCard tasks={tasks} />
            </div>

            <div className="flex items-center gap-2">
              <label className="relative min-w-0 flex-1">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                />
                <input
                  aria-label="Tìm kiếm công việc"
                  className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm nhanh nhiệm vụ..."
                  type="search"
                  value={query}
                />
              </label>
              <button
                className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover md:hidden sm:px-4"
                onClick={() => setIsAddOpen(true)}
                type="button"
              >
                <Icon name="plus" className="h-5 w-5" />
                <span className="hidden sm:inline">Thêm việc</span>
              </button>
            </div>

            <section className="rounded-2xl border border-border bg-white px-3 py-2 shadow-sm sm:px-3.5">
              <div className="flex items-center justify-between gap-2">
                <div aria-label="Lọc công việc" className="flex min-w-0 items-center gap-1 sm:gap-2">
                  <button
                    aria-pressed={filter === "all"}
                    className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:px-3.5 ${
                      filter === "all" ? "bg-primary text-white" : "text-muted hover:bg-[#f0fdf4]"
                    }`}
                    onClick={() => setFilter("all")}
                    type="button"
                  >
                    Tất cả
                    <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5">
                      {tasks.length}
                    </span>
                  </button>
                  <button
                    aria-pressed={filter === "pending"}
                    className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:px-3.5 ${
                      filter === "pending" ? "bg-primary text-white" : "text-muted hover:bg-[#f0fdf4]"
                    }`}
                    onClick={() => setFilter("pending")}
                    type="button"
                  >
                    <span className="sm:hidden">Cần làm</span>
                    <span className="hidden sm:inline">Chưa xong</span>
                    <span className="ml-1 rounded-full bg-black/5 px-1.5 py-0.5">
                      {tasks.filter((task) => !task.is_done).length}
                    </span>
                  </button>
                  <button
                    aria-pressed={filter === "completed"}
                    className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:px-3.5 ${
                      filter === "completed" ? "bg-primary text-white" : "text-muted hover:bg-[#f0fdf4]"
                    }`}
                    onClick={() => setFilter("completed")}
                    type="button"
                  >
                    <span>Đã xong</span>
                    <span className="ml-1 rounded-full bg-black/5 px-1.5 py-0.5">
                      {tasks.filter((task) => task.is_done).length}
                    </span>
                  </button>
                </div>
                <div className="relative shrink-0">
                  <button
                    aria-expanded={isSortOpen}
                    aria-haspopup="menu"
                    aria-label="Chọn cách sắp xếp"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-[#f0fdf4] hover:text-foreground"
                    onClick={() => setIsSortOpen((current) => !current)}
                    type="button"
                  >
                    <Icon name="sort" className="h-5 w-5" />
                  </button>
                  {isSortOpen && (
                    <div
                      aria-label="Sắp xếp công việc"
                      className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-white p-1.5 shadow-lg"
                      role="menu"
                    >
                      <button
                        aria-checked={sortBy === "time"}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-[#f0fdf4]"
                        onClick={() => {
                          setSortBy("time");
                          setIsSortOpen(false);
                        }}
                        role="menuitemradio"
                        type="button"
                      >
                        Theo thời gian
                        {sortBy === "time" && <Icon name="check" className="h-4 w-4 text-primary" />}
                      </button>
                      <button
                        aria-checked={sortBy === "name"}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-[#f0fdf4]"
                        onClick={() => {
                          setSortBy("name");
                          setIsSortOpen(false);
                        }}
                        role="menuitemradio"
                        type="button"
                      >
                        Theo tên
                        {sortBy === "name" && <Icon name="check" className="h-4 w-4 text-primary" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <TaskList
              filter={filter}
              onDelete={deleteTask}
              onEdit={editTask}
              onToggle={toggleTask}
              tasks={visibleTasks}
            />
          </section>

          <aside className="hidden flex-col gap-5 lg:col-span-4 lg:flex">
            <ProgressCard tasks={tasks} />
            <section className="rounded-2xl bg-[#e0faeb] p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Icon name="sparkles" className="h-[18px] w-[18px]" />
                Cảm hứng học tập
              </div>
              <blockquote className="mt-3 text-sm italic leading-6 text-foreground">
                “Sự kiên trì nhỏ mỗi ngày sẽ tạo nên kết quả phi thường theo năm
                tháng. Hãy làm từng bước thật vững chãi.”
              </blockquote>
              <p className="mt-4 text-xs text-muted">— James Clear, Người Tối Giản</p>
            </section>
            <PomodoroCard />
          </aside>
          <div className="lg:hidden">
            <PomodoroCard />
          </div>
        </div>
      </main>

      <nav
        aria-label="Điều hướng mobile"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-[#f0fdf4]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-lg lg:hidden"
      >
        <Link className="flex flex-col items-center gap-1 py-1 text-xs font-semibold text-primary" href="/tasks">
          <Icon name="check" className="h-5 w-5" />
          Công việc
        </Link>
        <span className="flex flex-col items-center gap-1 py-1 text-xs text-muted">
          <Icon name="calendar" className="h-5 w-5" />
          Lịch học
        </span>
        <span className="flex flex-col items-center gap-1 py-1 text-xs text-muted">
          <Icon name="trending" className="h-5 w-5" />
          Tiến độ
        </span>
        <Link className="flex flex-col items-center gap-1 py-1 text-xs text-muted" href="/login">
          <Icon name="book" className="h-5 w-5" />
          Tài khoản
        </Link>
      </nav>

      <button
        aria-label="Thêm công việc mới"
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-hover active:scale-95 md:hidden"
        onClick={() => setIsAddOpen(true)}
        type="button"
      >
        <Icon name="plus" className="h-7 w-7" />
      </button>

      {isAddOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f2a1d]/35 p-3">
          <section
            aria-labelledby="new-task-dialog-title"
            aria-modal="true"
            className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-semibold" id="new-task-dialog-title">
                Thêm công việc mới
              </h2>
              <button
                aria-label="Đóng"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-[#f0fdf4]"
                onClick={() => setIsAddOpen(false)}
                type="button"
              >
                <span aria-hidden="true" className="text-2xl leading-none">×</span>
              </button>
            </div>
            <TaskForm onAddTask={addTask} onCancel={() => setIsAddOpen(false)} />
          </section>
        </div>
      )}
    </div>
  );
}
