"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";
import { Icon } from "./Icon";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import type { Task, TaskFilter } from "./task";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function apiFetch(
  path: string,
  options: RequestInit,
  onUnauthorized: () => void,
): Promise<unknown> {
  try {
    const { data, error } = await getSupabaseBrowserClient().auth.getSession();
    if (error) throw new ApiRequestError("Không thể kiểm tra phiên đăng nhập.");
    if (!data.session) {
      onUnauthorized();
      throw new ApiRequestError("Phiên đăng nhập đã hết hạn.", 401);
    }

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
    if (options.body !== undefined) headers.set("Content-Type", "application/json");

    const response = await fetch(path, { ...options, headers });
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new ApiRequestError("Máy chủ trả về phản hồi không hợp lệ.", response.status);
    }

    if (response.status === 401) {
      onUnauthorized();
      throw new ApiRequestError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
    }
    if (!response.ok) {
      const errorMessage =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
          ? body.error
          : "Không thể hoàn tất yêu cầu.";
      throw new ApiRequestError(errorMessage, response.status);
    }

    return body;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
  }
}

const taskListResponse = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      is_done: z.boolean(),
      created_at: z.string(),
      due_at: z.string().nullable(),
    }),
  ),
});

function getAccountDisplayName(user: User | null | undefined) {
  for (const key of ["full_name", "name"] as const) {
    const name = user?.user_metadata[key];
    if (typeof name === "string" && name.trim()) return name.trim();
  }

  return user?.email?.split("@")[0]?.trim() || "Bạn";
}

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
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    if (endTime === null) return;
    const activeEndTime = endTime;

    function updateRemainingTime() {
      const remaining = Math.max(0, Math.ceil((activeEndTime - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) setEndTime(null);
    }

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 250);
    return () => window.clearInterval(intervalId);
  }, [endTime]);

  function toggleTimer() {
    if (endTime !== null) {
      setRemainingSeconds(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
      setEndTime(null);
      return;
    }

    const duration = remainingSeconds > 0 ? remainingSeconds : 25 * 60;
    setRemainingSeconds(duration);
    setEndTime(Date.now() + duration * 1000);
  }

  function resetTimer() {
    setEndTime(null);
    setRemainingSeconds(25 * 60);
  }

  const isFocusing = endTime !== null;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const buttonLabel = isFocusing
    ? "Tạm dừng"
    : remainingSeconds === 0
      ? "Bắt đầu lại"
      : remainingSeconds < 25 * 60
        ? "Tiếp tục"
        : "Bắt đầu";

  return (
    <section
      aria-label="Đồng hồ Pomodoro"
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm"
      role="region"
    >
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <Icon name="timer" className="h-4 w-4 text-primary" />
          Pomodoro
        </div>
        <p
          aria-label="Thời gian Pomodoro"
          aria-live="off"
          className="font-display mt-1 text-2xl font-bold tabular-nums text-primary"
          role="timer"
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          aria-label="Đặt lại Pomodoro"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-[#f0fdf4] hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={resetTimer}
          title="Đặt lại Pomodoro"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
        <button
          aria-label={buttonLabel}
          aria-pressed={isFocusing}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#dcfce7] px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-[#c8f5d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={toggleTimer}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            {isFocusing ? (
              <>
                <rect height="14" rx="1.5" width="4" x="6" y="5" />
                <rect height="14" rx="1.5" width="4" x="14" y="5" />
              </>
            ) : (
              <path d="M7.5 4.8a1 1 0 0 1 1.02.03l11 6.2a1.1 1.1 0 0 1 0 1.94l-11 6.2A1 1 0 0 1 7 18.3V5.7a1 1 0 0 1 .5-.9Z" />
            )}
          </svg>
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}

export function TaskDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"time" | "name">("time");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set());
  const isAddingTaskRef = useRef(false);
  const pendingTaskIdsRef = useRef(new Set<string>());
  const refreshGenerationRef = useRef(0);
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "unauthenticated" | "error"
  >("loading");
  const [authError, setAuthError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [displayName, setDisplayName] = useState("Bạn");

  const clearDashboardState = useCallback(() => {
    refreshGenerationRef.current += 1;
    setTasks([]);
    setDisplayName("Bạn");
    setFilter("all");
    setQuery("");
    setIsAddOpen(false);
    setIsSortOpen(false);
    setSortBy("time");
    setTaskError("");
  }, []);

  useEffect(() => {
    let isMounted = true;
    let receivedAuthEvent = false;
    let unsubscribe: (() => void) | undefined;

    void Promise.resolve()
      .then(() => {
        if (!isMounted) return null;

        const supabase = getSupabaseBrowserClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          receivedAuthEvent = true;
          if (!isMounted) return;

          setAuthError("");
          setDisplayName(getAccountDisplayName(session?.user));
          if (session) {
            setAuthStatus("authenticated");
          } else {
            clearDashboardState();
            setAuthStatus("unauthenticated");
          }
        });

        unsubscribe = () => subscription.unsubscribe();
        return supabase.auth.getSession();
      })
      .then((result) => {
        if (!result || !isMounted || receivedAuthEvent) return;
        const { data, error } = result;
        if (error) {
          setAuthError("Không thể kiểm tra phiên đăng nhập. Vui lòng tải lại trang.");
          setAuthStatus("error");
          return;
        }
        if (data.session) {
          setDisplayName(getAccountDisplayName(data.session.user));
          setAuthStatus("authenticated");
        } else {
          clearDashboardState();
          setAuthStatus("unauthenticated");
        }
      })
      .catch((error: unknown) => {
        if (!isMounted || receivedAuthEvent) return;
        setAuthError(
          error instanceof Error && error.message.startsWith("Thiếu cấu hình Supabase.")
            ? error.message
            : "Không thể kết nối để kiểm tra phiên đăng nhập. Vui lòng thử lại.",
        );
        setAuthStatus("error");
      });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [clearDashboardState]);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  const refreshTasks = useCallback(async () => {
    const generation = ++refreshGenerationRef.current;
    setIsLoadingTasks(true);
    setTaskError("");
    try {
      const result = taskListResponse.safeParse(
        await apiFetch("/api/tasks", { method: "GET" }, () => router.replace("/login")),
      );
      if (!result.success) {
        throw new ApiRequestError("Dữ liệu công việc từ máy chủ không hợp lệ.");
      }
      if (generation !== refreshGenerationRef.current) return;
      setTasks(result.data.data.map(({ id, title, is_done, due_at }) => ({ id, title, is_done, due_at })));
    } catch (error) {
      if (generation !== refreshGenerationRef.current) return;
      setTaskError(
        error instanceof ApiRequestError
          ? error.message
          : "Không thể tải danh sách công việc. Vui lòng thử lại.",
      );
    } finally {
      if (generation === refreshGenerationRef.current) setIsLoadingTasks(false);
    }
  }, [router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let isMounted = true;
    void Promise.resolve().then(() => {
      if (isMounted) return refreshTasks();
    });
    return () => {
      isMounted = false;
    };
  }, [authStatus, refreshTasks]);

  async function handleSignOut() {
    setIsSigningOut(true);
    setAuthError("");

    try {
      const { error } = await getSupabaseBrowserClient().auth.signOut();
      if (error) {
        setAuthError("Không thể đăng xuất. Vui lòng thử lại.");
        setIsSigningOut(false);
        return;
      }

      clearDashboardState();
      setAuthStatus("unauthenticated");
      router.replace("/login");
    } catch {
      setAuthError("Không thể kết nối để đăng xuất. Vui lòng thử lại.");
      setIsSigningOut(false);
    }
  }

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

      const aDueAt = a.due_at ? Date.parse(a.due_at) : Number.MAX_SAFE_INTEGER;
      const bDueAt = b.due_at ? Date.parse(b.due_at) : Number.MAX_SAFE_INTEGER;
      return aDueAt - bDueAt;
    });
  }, [query, sortBy, tasks]);

  async function addTask(newTask: Omit<Task, "id" | "is_done">) {
    if (isAddingTaskRef.current) return false;
    isAddingTaskRef.current = true;
    setIsAddingTask(true);
    setTaskError("");
    try {
      await apiFetch(
        "/api/tasks",
        { method: "POST", body: JSON.stringify({ title: newTask.title, due_at: newTask.due_at }) },
        () => router.replace("/login"),
      );
      setFilter("pending");
      setIsAddOpen(false);
      await refreshTasks();
      return true;
    } catch (error) {
      setTaskError(
        error instanceof ApiRequestError
          ? error.message
          : "Không thể thêm công việc. Vui lòng thử lại.",
      );
      return false;
    } finally {
      isAddingTaskRef.current = false;
      setIsAddingTask(false);
    }
  }

  async function updateTask(id: string, patch: { title: string } | { is_done: boolean }) {
    if (pendingTaskIdsRef.current.has(id)) return false;
    pendingTaskIdsRef.current.add(id);
    setPendingTaskIds(new Set(pendingTaskIdsRef.current));
    setTaskError("");
    try {
      await apiFetch(
        `/api/tasks/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify(patch) },
        () => router.replace("/login"),
      );
      await refreshTasks();
      return true;
    } catch (error) {
      setTaskError(
        error instanceof ApiRequestError
          ? error.message
          : "Không thể cập nhật công việc. Vui lòng thử lại.",
      );
      return false;
    } finally {
      pendingTaskIdsRef.current.delete(id);
      setPendingTaskIds(new Set(pendingTaskIdsRef.current));
    }
  }

  async function toggleTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (task) await updateTask(id, { is_done: !task.is_done });
  }

  async function editTask(id: string, title: string) {
    return updateTask(id, { title });
  }

  async function deleteTask(id: string) {
    if (pendingTaskIdsRef.current.has(id)) return;
    pendingTaskIdsRef.current.add(id);
    setPendingTaskIds(new Set(pendingTaskIdsRef.current));
    setTaskError("");
    try {
      await apiFetch(
        `/api/tasks/${encodeURIComponent(id)}`,
        { method: "DELETE" },
        () => router.replace("/login"),
      );
      await refreshTasks();
    } catch (error) {
      setTaskError(
        error instanceof ApiRequestError
          ? error.message
          : "Không thể xóa công việc. Vui lòng thử lại.",
      );
    } finally {
      pendingTaskIdsRef.current.delete(id);
      setPendingTaskIds(new Set(pendingTaskIdsRef.current));
    }
  }

  if (authStatus === "loading") {
    return (
      <main
        aria-busy="true"
        className="flex min-h-screen items-center justify-center bg-[#f0fdf4] px-4 text-sm text-muted"
      >
        Đang kiểm tra phiên đăng nhập...
      </main>
    );
  }

  if (authStatus === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0fdf4] px-4">
        <p className="text-center text-sm text-[#b42318]" role="alert">
          {authError}
        </p>
      </main>
    );
  }

  if (authStatus !== "authenticated") return null;

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
              <span className="block text-xs font-semibold">{displayName}</span>
              <span className="block text-[11px] text-muted">Sinh viên</span>
            </span>
            <Image
              alt={`Ảnh đại diện ${displayName}`}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
              height={36}
              src="/images/aesthetic-blue-flower.jpg"
              width={36}
            />
            <button
              aria-label="Đăng xuất"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-[#ffdad6]/60 hover:text-[#b42318]"
              title="Đăng xuất"
              disabled={isSigningOut}
              onClick={handleSignOut}
              type="button"
            >
              <Icon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 pb-8 pt-20 sm:gap-6 sm:px-6 lg:px-8">
        {authError && (
          <p className="text-sm text-[#b42318]" role="alert">
            {authError}
          </p>
        )}
        {taskError && (
          <p className="text-sm text-[#b42318]" role="alert">
            {taskError}
          </p>
        )}
        <div className="hidden flex-wrap items-end justify-between gap-3 md:flex">
          <div>
            <p className="mb-1 text-sm text-muted md:hidden">Thứ Ba, 24 Tháng 10</p>
            <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight sm:text-3xl">
              Chào buổi sáng!
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
              <TaskForm isSubmitting={isAddingTask} onAddTask={addTask} />
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
                disabled={isAddingTask}
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

            {isLoadingTasks ? (
              <p aria-live="polite" className="py-8 text-center text-sm text-muted" role="status">
                Đang tải công việc...
              </p>
            ) : tasks.length === 0 && !taskError ? (
              <p className="rounded-2xl border border-dashed border-border bg-white/70 px-4 py-8 text-center text-sm text-muted">
                Chưa có công việc nào. Hãy thêm công việc đầu tiên của bạn.
              </p>
            ) : tasks.length > 0 ? (
              <TaskList
                filter={filter}
                onDelete={deleteTask}
                onEdit={editTask}
                onToggle={toggleTask}
                pendingTaskIds={pendingTaskIds}
                tasks={visibleTasks}
              />
            ) : null}
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
        disabled={isAddingTask}
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
                disabled={isAddingTask}
                onClick={() => setIsAddOpen(false)}
                type="button"
              >
                <span aria-hidden="true" className="text-2xl leading-none">×</span>
              </button>
            </div>
            <TaskForm
              isSubmitting={isAddingTask}
              onAddTask={addTask}
              onCancel={() => setIsAddOpen(false)}
            />
          </section>
        </div>
      )}
    </div>
  );
}
