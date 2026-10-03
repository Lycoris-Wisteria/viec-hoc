# DESIGN.md — Tài liệu thiết kế web


---

## 1. Tổng quan dự án

- **Tên dự án:** [Việc học của tôi]
- **Mục đích:** [Website giải quyết vấn đề gì?]
- **Đối tượng người dùng:** [20 - 25 tuổi]
- **Mục tiêu chính:** [Học tập]
- **Từ khóa cảm xúc (3–5 từ):** [Tự nhiên, nhẹ nhàng, tin cậy, tối giản]
- **Nền tảng:** Thiết kế giao diện tương thích mobile và web (responsive), hiển thị tốt trên điện thoại, máy tính bảng và máy tính.
- **Tham khảo:** [Link các website bạn thích]

---

## 2. Nguyên tắc thiết kế

1. **Rõ ràng trước, đẹp sau** — mỗi trang chỉ có một hành động chính.
2. **Nhất quán** — dùng lại component, không tự chế style mới.
3. **Khoảng trắng hào phóng** — để nội dung "thở".
4. **Dễ tiếp cận (accessibility)** — tương phản đủ, bấm được bằng ngón tay, dùng được bằng bàn phím.
5. **Tương thích mobile và web** — thiết kế mobile-first (màn hình nhỏ trước), sau đó mở rộng lên tablet và desktop; trải nghiệm phải nhất quán và dễ dùng trên mọi thiết bị.

---

## 3. Màu sắc

| Vai trò | Tên token | Mã HEX | Dùng cho |
|---|---|---|---|
**Tông chủ đạo: xanh lá nhạt (mint / sage) — tươi mát, dịu mắt, gợi cảm giác tự nhiên và thư giãn.**

| Vai trò | Tên token | Mã HEX | Dùng cho |
|---|---|---|---|
| Primary | `--color-primary` | `#15803D` | Nút chính, link (xanh lá đậm vừa để chữ trắng đủ tương phản) |
| Primary hover | `--color-primary-hover` | `#166534` | Trạng thái hover |
| Primary light | `--color-primary-light` | `#86EFAC` | Điểm nhấn, icon, đường gạch chân |
| Primary soft | `--color-primary-soft` | `#DCFCE7` | Nền badge, highlight, hover nhẹ |
| Secondary | `--color-secondary` | `#0D9488` | Điểm nhấn phụ (xanh ngọc) |
| Background | `--color-bg` | `#FFFFFF` | Nền trang |
| Surface | `--color-surface` | `#F0FDF4` | Card, section xen kẽ (xanh lá rất nhạt) |
| Border | `--color-border` | `#D1E7D8` | Đường viền |
| Text chính | `--color-text` | `#0F2A1D` | Tiêu đề, nội dung (xanh đen) |
| Text phụ | `--color-text-muted` | `#5B7266` | Mô tả, caption |
| Success | `--color-success` | `#22C55E` | Thành công |
| Warning | `--color-warning` | `#F59E0B` | Cảnh báo |
| Error | `--color-error` | `#DC2626` | Lỗi |

**Tỷ lệ sử dụng gợi ý (60-30-10):**
- 60% nền trắng + xanh lá rất nhạt (`bg`, `surface`)
- 30% xanh lá nhạt/mint (`primary-soft`, `primary-light`)
- 10% xanh lá đậm (`primary`) cho nút và link quan trọng

**Dark mode (nếu có):** nền `#0A1A12`, surface `#112419`, text `#E6F4EA`, primary `#4ADE80`.

**Quy tắc:**
- Tỷ lệ tương phản chữ/nền tối thiểu **4.5:1** (WCAG AA).
- **Không** đặt chữ trắng lên nền xanh lá nhạt (`#86EFAC`, `#DCFCE7`) vì rất khó đọc. Trên nền nhạt dùng chữ `#0F2A1D`; chữ trắng chỉ dùng trên `primary` đậm.
- Không dùng màu làm tín hiệu duy nhất (thêm icon hoặc chữ cho trạng thái thành công/lỗi).

---

## 4. Typography

- **Font tiêu đề:** [Playfair Display]
- **Font nội dung:** [Inter]
- **Font code:** `ui-monospace`
- **Lưu ý tiếng Việt:** chọn font hỗ trợ đầy đủ dấu (Be Vietnam Pro, Inter, Roboto, Noto Sans).

| Cấp | Desktop | Mobile | Weight | Line-height |
|---|---|---|---|---|
| H1 | 56px | 36px | 700 | 1.1 |
| H2 | 40px | 28px | 700 | 1.2 |
| H3 | 28px | 22px | 600 | 1.3 |
| H4 | 20px | 18px | 600 | 1.4 |
| Body | 16px | 16px | 400 | 1.6 |
| Small | 14px | 14px | 400 | 1.5 |
| Caption | 12px | 12px | 500 | 1.4 |

- Độ dài dòng chữ tối ưu: **60–75 ký tự**.
- Không dùng font nhỏ hơn 14px cho nội dung chính.

---

## 5. Khoảng cách & lưới (Spacing & Grid)

**Thang spacing (bội số của 4px):**
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`

**Breakpoints:**

| Tên | Chiều rộng |
|---|---|
| Mobile | < 640px |
| Tablet | 640–1023px |
| Desktop | 1024–1279px |
| Wide | ≥ 1280px |

- **Container tối đa:** 1200px, padding ngang 16px (mobile) / 24px (tablet) / 32px (desktop).
- **Grid:** 4 cột (mobile) · 8 cột (tablet) · 12 cột (desktop), gutter 24px.
- **Khoảng cách giữa các section:** 96px (desktop) / 64px (mobile).

---

## 6. Hình khối & hiệu ứng

- **Bo góc:** nhỏ `6px` · vừa `12px` · lớn `20px` · tròn `9999px`
- **Đổ bóng:**
  - `sm`: `0 1px 2px rgba(0,0,0,0.06)`
  - `md`: `0 4px 12px rgba(0,0,0,0.08)`
  - `lg`: `0 12px 32px rgba(0,0,0,0.12)`
- **Transition mặc định:** `200ms ease-out`
- **Animation:** nhẹ, có mục đích; tôn trọng `prefers-reduced-motion`.

---

## 7. Component

### Button
| Loại | Kiểu dáng | Dùng khi |
|---|---|---|
| Primary | Nền primary, chữ trắng | Hành động chính (1 nút/khu vực) |
| Secondary | Viền primary, nền trong | Hành động phụ |
| Ghost | Không viền, chữ primary | Hành động nhẹ |
| Danger | Nền error | Xóa, hành động nguy hiểm |

- Chiều cao: 40px (mặc định), 48px (lớn). Padding ngang 20px. Bo góc 12px.
- Trạng thái: default · hover · active · focus (viền 2px) · disabled (opacity 50%) · loading.
- Vùng chạm tối thiểu **44×44px**.

### Form / Input
- Cao 44px, viền `--color-border`, bo góc 8px.
- Label đặt phía trên, không dùng placeholder thay label.
- Focus: viền primary + vòng sáng 3px.
- Lỗi: viền error + thông báo ngắn bên dưới.

### Card
- Nền surface, viền 1px, bo góc 12–20px, padding 24px.
- Hover: nâng nhẹ + shadow `md`.

### Navigation (Header)
- Cao 64–72px, logo trái, menu giữa/phải, CTA ngoài cùng bên phải.
- Dính trên cùng khi cuộn (sticky), nền mờ nhẹ.
- Mobile: menu hamburger → drawer toàn màn hình.

### Footer
- 3–4 cột liên kết, thông tin liên hệ, mạng xã hội, bản quyền.

### Khác
- **Modal:** overlay 50% đen, đóng bằng nút X / Esc / click nền.
- **Toast:** góc trên/dưới phải, tự đóng sau 4–5 giây.
- **Badge/Tag:** bo tròn, chữ 12px.

---

## 8. Cấu trúc trang

### Trang đăng nhập
- Có trang đăng nhập gồm Email, Mật khẩu, Đăng nhập. Trang công việc gồm ô Tên công việc, nút Thêm công việc, danh sách có checkbox hoàn thành, Sửa, Xóa, bộ lọc Tất cả, Chưa xong, Đã xong và Đăng xuất. 

### Trang công việc
- Trang công việc gồm ô Tên công việc, nút Thêm công việc, danh sách có checkbox hoàn thành, Sửa, Xóa, bộ lọc Tất cả, Chưa xong, Đã xong và Đăng xuất.

---

## 9. Hình ảnh & Icon

- **Phong cách ảnh:** [Ảnh thật / minh họa phẳng / 3D...]
- **Tỷ lệ ảnh:** 16:9 (banner), 4:3 (card), 1:1 (avatar).
- **Icon:** [Lucide / Heroicons / Phosphor], stroke 1.5–2px, kích thước 20/24px.
- **Định dạng:** WebP/AVIF, có `alt` mô tả đầy đủ, lazy-load ảnh dưới màn hình đầu.

---

## 10. Giọng văn (Content & Tone)

- **Giọng điệu:** [Thân thiện / chuyên nghiệp / trẻ trung]
- **Xưng hô:** [Bạn – chúng tôi / Quý khách – công ty]
- **Nút CTA:** động từ + lợi ích ("Bắt đầu miễn phí", "Nhận tư vấn").
- **Tiêu đề:** ngắn, nêu lợi ích, tránh thuật ngữ.

---

## 11. Accessibility & Hiệu năng

- [ ] Tương phản màu đạt WCAG AA
- [ ] Điều hướng được bằng bàn phím, focus rõ ràng
- [ ] Thẻ ngữ nghĩa (`header`, `main`, `nav`, `section`, `footer`)
- [ ] Mọi ảnh có `alt`, form có `label`
- [ ] LCP < 2.5s, CLS < 0.1
- [ ] Hỗ trợ `prefers-reduced-motion` và `prefers-color-scheme`

---

## 12. Công nghệ

- **Framework:** [HTML/CSS thuần / React / Next.js / Vue...]
- **Styling:** [Tailwind CSS / CSS Modules / SCSS]
- **Thư viện UI:** [shadcn/ui / MUI / không dùng]
- **Hosting:** [Vercel / Netlify / ...]

### CSS tokens mẫu

```css
:root {
  --color-primary: #15803D;
  --color-primary-hover: #166534;
  --color-primary-light: #86EFAC;
  --color-primary-soft: #DCFCE7;
  --color-secondary: #0D9488;
  --color-bg: #FFFFFF;
  --color-surface: #F0FDF4;
  --color-border: #D1E7D8;
  --color-text: #0F2A1D;
  --color-text-muted: #5B7266;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --transition: 200ms ease-out;

  --font-heading: "Be Vietnam Pro", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}
```

---

## 13. Việc không nên làm (Do / Don't)

**Nên:**
- Dùng đúng token màu và spacing đã định nghĩa.
- Giữ một CTA chính nổi bật mỗi màn hình.

**Không nên:**
- Tự thêm màu, font, bo góc ngoài hệ thống.
- Dùng quá 2 font family.
- Chữ xám nhạt trên nền trắng khó đọc.
- Hiệu ứng chuyển động rối mắt hoặc kéo dài.

---

## 14. Nhật ký thay đổi

| Ngày | Thay đổi | Người cập nhật |
|---|---|---|
| 2026-10-01 | Khởi tạo tài liệu | Oanhvk |
