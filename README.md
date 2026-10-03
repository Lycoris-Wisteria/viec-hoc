# Việc học của tôi

Giao diện học tập responsive được xây dựng bằng Next.js App Router, TypeScript và Tailwind CSS.

## Chạy ứng dụng

```bash
npm install
# Hoặc cài chính xác theo package-lock.json:
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem trang công việc.
Trang chủ tự chuyển đến `/tasks`; giao diện đăng nhập mẫu nằm tại
[http://localhost:3000/login](http://localhost:3000/login).

## Các trang

- `/login`: form giao diện mẫu; không lưu hoặc gửi thông tin đăng nhập.
- `/tasks`: bảng công việc với tìm kiếm, lọc, thêm, sửa, xóa có xác nhận và đánh dấu hoàn thành. Tên công việc sau khi bỏ khoảng trắng đầu/cuối phải dài từ 1 đến 120 ký tự. Dữ liệu chỉ nằm trong state trên trình duyệt và mất khi tải lại trang.

Giao diện sử dụng các component trong `src/app/components`. Hiện dự án chưa có tài nguyên trong `public/images`; biểu tượng được vẽ bằng SVG nội tuyến.

## Lưu ý
- Chưa có database
- Chưa có đăng nhập thật, dữ liệu mẫu tạm thời 
