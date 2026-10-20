"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        switch (error.code) {
          case "invalid_credentials":
            setErrorMessage("Email hoặc mật khẩu không chính xác.");
            break;
          case "email_not_confirmed":
            setErrorMessage("Email của bạn chưa được xác nhận. Vui lòng kiểm tra hộp thư.");
            break;
          case "user_banned":
            setErrorMessage("Tài khoản hiện đang bị tạm khóa. Vui lòng liên hệ quản trị viên.");
            break;
          case "over_request_rate_limit":
          case "too_many_requests":
            setErrorMessage("Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.");
            break;
          default:
            setErrorMessage("Không thể đăng nhập. Vui lòng kiểm tra thông tin và thử lại.");
        }
        return;
      }

      if (!data.session) {
        setErrorMessage("Đăng nhập chưa hoàn tất vì chưa nhận được phiên đăng nhập. Vui lòng thử lại.");
        return;
      }

      router.push("/tasks");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message.startsWith("Thiếu cấu hình Supabase.")
          ? error.message
          : "Không thể kết nối đến dịch vụ đăng nhập. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center px-4 py-2 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-5xl py-1 lg:py-3">
        <div className="pointer-events-none absolute -left-16 -top-10 -z-10 h-72 w-72 rounded-full bg-[#dcfce7]/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-10 -z-10 h-80 w-80 rounded-full bg-[#d5eedf]/70 blur-3xl" />

        <div className="grid items-center gap-4 lg:grid-cols-12 lg:gap-8">
          <section className="hidden flex-col gap-5 pr-4 lg:col-span-5 lg:flex">
            <div>
              <h2 className="font-display text-[40px] font-bold leading-[1.2] tracking-tight">
                Khởi đầu ngày mới với sự tập trung.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted">
                Tối ưu hóa nhịp học tập tự nhiên của bạn với kế hoạch có cấu
                trúc, hướng về hiệu quả dài hạn.
              </p>
            </div>

            <div className="rounded-2xl bg-[#e0faeb] p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Icon name="book" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Mục tiêu hôm nay</p>
                  <p className="text-xs text-muted">3 nhiệm vụ cần hoàn thành</p>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#dcfce7]">
                <div className="h-full w-[65%] rounded-full bg-primary" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted">
                <span>Tiến độ</span>
                <span className="font-semibold text-primary">65%</span>
              </div>
            </div>

            <blockquote className="flex items-start gap-3 text-sm italic leading-6 text-muted">
              <Icon name="quote" className="mt-1 h-4 w-4 shrink-0 text-primary" />
              “Sự kỷ luật không ồn ào là chiếc cầu nối bền vững nhất đưa bạn tới
              ước mơ.”
            </blockquote>
          </section>

          <section className="w-full lg:col-span-7">
            <header className="mb-3 flex flex-col items-center text-center lg:hidden">
              <div className="relative mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0faeb] text-primary">
                  <Icon name="book" className="h-6 w-6" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-[#f0fdf4] bg-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold leading-tight tracking-tight">
                Chào mừng bạn trở lại
              </h1>
              <p className="mt-1.5 max-w-[320px] text-sm leading-5 text-[#3f493f]">
                Đăng nhập để tiếp tục kế hoạch học tập cùng Việc Học Của Tôi
              </p>
            </header>

            <div className="mx-auto w-full max-w-[480px] rounded-2xl bg-white p-3.5 shadow-[0_12px_32px_rgba(15,42,29,0.12)] sm:p-5">
            <div className="mb-3 hidden flex-col gap-1.5 lg:flex">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dcfce7] text-primary">
                    <Icon name="book" className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Việc học của tôi
                  </span>
                </div>
                <h1 className="font-display text-[22px] font-semibold">
                  Chào mừng bạn trở lại
                </h1>
                <p className="text-xs leading-5 text-muted">
                  Đăng nhập để tiếp tục kế hoạch học tập cùng Việc Học Của Tôi
                </p>
              </div>

              <form className="flex flex-col gap-3" method="post" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="email">
                    <Icon name="mail" className="h-[18px] w-[18px] text-primary" />
                    Email sinh viên / tài khoản
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="username"
                      className="h-12 w-full rounded-xl border border-border bg-white px-3.5 pr-11 text-sm placeholder:text-muted/75 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      id="email"
                      name="email"
                      placeholder="vidu@sinhvien.edu.vn"
                      required
                      type="email"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                      @
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="password">
                      <Icon name="lock" className="h-[18px] w-[18px] text-primary" />
                      Mật khẩu
                    </label>
                    <button className="text-xs font-medium text-primary hover:text-primary-hover" type="button">
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-border bg-white px-3.5 pr-4 text-sm placeholder:text-muted/75 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      id="password"
                      name="password"
                      placeholder="••••••••••••"
                      required
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="hidden"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm text-[#3f493f]">
                  <input
                    className="h-5 w-5 accent-primary"
                    defaultChecked
                    name="remember"
                    type="checkbox"
                  />
                  Ghi nhớ trạng thái đăng nhập
                </label>

                <button
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-display text-base font-semibold text-white shadow-md transition hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  {!isSubmitting && <Icon name="arrow" className="h-5 w-5" />}
                </button>
                {errorMessage && (
                  <p aria-live="polite" className="text-center text-sm text-[#b42318]" role="alert">
                    {errorMessage}
                  </p>
                )}
              </form>

              <div className="relative my-3 flex items-center justify-center">
                <div className="h-px w-full bg-border" />
                <span className="absolute bg-white px-3 text-xs text-muted">
                  hoặc tiếp tục với
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-[#f0fdf4] text-sm font-semibold hover:bg-[#e0faeb]"
                  type="button"
                >
                  <span className="font-bold text-[#4285f4]">G</span>
                  Google
                </button>
                <button
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-[#f0fdf4] text-sm font-semibold hover:bg-[#e0faeb]"
                  type="button"
                >
                  <Icon name="book" className="h-[18px] w-[18px] text-primary" />
                  Cổng trường
                </button>
              </div>

              <p className="mt-3 text-center text-sm text-muted">
                Chưa có tài khoản?
                <span className="ml-1 font-semibold text-primary">Đăng ký ngay</span>
              </p>
            </div>

            <footer className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>Bảo mật thông tin sinh viên</span>
              <span aria-hidden="true">•</span>
              <span>Điều khoản dịch vụ</span>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <span className="hidden sm:inline">Quy định bảo mật</span>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
