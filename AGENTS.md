<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Hướng dẫn làm việc với dự án

- Dùng Next.js App Router trong `src/app` và các dependency đã khai báo, cài đặt trong dự án. Không tự ý chuyển sang Pages Router hoặc cài dependency mới nếu chưa cần thiết.
- Giữ giao diện nhất quán với các thiết kế trong `design/stitch`, gồm bố cục responsive, màu sắc, font chữ và khoảng cách. Dùng tài nguyên cục bộ trong `public/images` khi có; không nhúng CDN Tailwind hoặc script từ HTML Stitch vào ứng dụng.
- Không mở, đọc, sao chép, hiển thị hoặc in nội dung `.env.local`.
- Không ghi mật khẩu, token hoặc thông tin xác thực vào log, thông báo, dữ liệu mẫu hay mã nguồn.
- Sau khi thay đổi, chạy kiểm tra phù hợp với phạm vi công việc và nêu rõ cách kiểm tra kết quả trong phần bàn giao.
