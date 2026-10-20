# Việc học của tôi

Ứng dụng quản lý nhiệm vụ học tập, xây dựng bằng Next.js App Router, TypeScript, Tailwind CSS và Supabase. Người dùng đăng nhập để tạo, sửa, hoàn thành và xóa nhiệm vụ; dữ liệu được lưu trong Supabase và giới hạn theo tài khoản bằng Row Level Security (RLS).

## Yêu cầu

- Node.js phiên bản LTS và npm.
- Một project Supabase.

## 1. Tạo project Supabase

1. Đăng nhập [Supabase](https://supabase.com/dashboard) và chọn **New project**.
2. Chọn organization, đặt tên project, tạo mật khẩu database mạnh và chọn region phù hợp.
3. Chờ project được khởi tạo.

Không đưa mật khẩu database, service role key hoặc thông tin xác thực vào mã nguồn, log, README hay GitHub.

## 2. Tạo bảng và chính sách truy cập

Trong Supabase Dashboard, mở **SQL Editor** → **New query**:

- Với project mới, mở `supabase/schema.sql`, sao chép nội dung vào query và chạy.
- Nếu bảng `public.tasks` đã được tạo từ schema cũ, chỉ chạy migration `supabase/migrations/20261020212700_add_task_due_at.sql` để thêm cột thời hạn. Không chạy lại các câu lệnh `CREATE TABLE` trên bảng đã tồn tại.

Schema tạo bảng nhiệm vụ, bật RLS và áp dụng chính sách để mỗi tài khoản chỉ đọc, thêm, sửa hoặc xóa nhiệm vụ của chính mình.

## 3. Tạo tài khoản đăng nhập và tài khoản kiểm thử

Trong Supabase Dashboard, mở **Authentication** → **Users** → **Add user**:

1. Tạo tài khoản email và mật khẩu dùng để đăng nhập ứng dụng.
2. Xác nhận email cho tài khoản, hoặc dùng tính năng xác nhận trong dashboard. Nếu project yêu cầu xác minh email, tài khoản phải được xác nhận trước khi đăng nhập.
3. Dùng một tài khoản riêng cho Playwright nếu có thể. Bài test sẽ đăng nhập tài khoản này, tạo/sửa/xóa dữ liệu thử trên database thật và dọn những nhiệm vụ do test tạo.

Tài khoản test A được cấu hình bằng `TEST_EMAIL_A` và `TEST_PASSWORD_A` trong `.env.local`. Đây là biến chỉ dành cho môi trường phát triển/kiểm thử, **không** thêm tiền tố `NEXT_PUBLIC_`. Bộ test hiện tại chỉ dùng tài khoản A; không cần cấu hình tài khoản B.

## 4. Cấu hình biến môi trường

Tạo `.env.local` ở thư mục gốc dự án. Có thể sao chép `.env.example`, sau đó điền giá trị từ Supabase Dashboard:

```powershell
Copy-Item .env.example .env.local
```

Lấy Project URL và publishable key trong **Project Settings** → **API** (hoặc mục **API Keys** tùy giao diện dashboard). Điền các giá trị cục bộ vào `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Chỉ cần cho các bài Playwright cần đăng nhập
TEST_EMAIL_A=<email-tai-khoan-test>
TEST_PASSWORD_A=<mat-khau-tai-khoan-test>
```

Thay phần trong dấu `<...>` bằng giá trị thật, không giữ dấu ngoặc. Publishable key được dùng bởi ứng dụng trình duyệt; không dùng service role key ở client. `.env.local` đã được Git ignore — không commit hoặc tải các biến này lên GitHub/Vercel.

## 5. Cài đặt và chạy ứng dụng

```bash
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Trang chủ chuyển tới khu vực nhiệm vụ; trang đăng nhập tại [http://localhost:3000/login](http://localhost:3000/login).

Các lệnh kiểm tra ứng dụng:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 6. Chạy Playwright

Cài browser Chromium một lần nếu máy chưa có:

```bash
npx playwright install chromium
```

Đảm bảo `TEST_EMAIL_A` và `TEST_PASSWORD_A` đã được điền trong `.env.local`, sau đó chạy:

```bash
npm run test:e2e
```

Playwright tự nạp `.env.local` qua `@next/env`, khởi chạy Next.js và chạy các test trên Chromium. Bộ test kiểm tra:

- API từ chối yêu cầu không có access token (`401`).
- API từ chối dữ liệu không hợp lệ (`400`) khi đã đăng nhập.
- Đăng nhập qua giao diện; tạo nhiệm vụ tên duy nhất; tải lại trang để xác nhận dữ liệu thật còn trong database; sửa, đánh dấu hoàn thành rồi xóa.
- Pomodoro đếm giờ, tạm dừng, tiếp tục và reset.

Các test có đăng nhập dùng Supabase thật, không mock database. Test tự dọn nhiệm vụ có tên duy nhất do nó tạo; nên dùng tài khoản riêng cho kiểm thử và không chạy test với tài khoản chứa dữ liệu quan trọng. Khi thiếu biến tài khoản test, các test cần đăng nhập sẽ bị bỏ qua; test API không token vẫn chạy.

Playwright reporter dùng `list`, vì vậy kết quả được hiển thị trực tiếp trong terminal; không cần mở HTML report.
