---
name: thiet-ke-ux-ui
description: >-
  Quy trình phân tích thiết kế UI/UX từ link Figma, trích xuất Design Tokens,
  đối chiếu hệ thống giao diện Book Management (React 19 + Tailwind CSS v4)
  và sinh mã component chuẩn mực hoặc phản biện UX. Dùng khi người dùng cung cấp link Figma,
  yêu cầu thiết kế/chỉnh sửa giao diện hoặc gõ /thiet-ke-ux-ui.
---

# Quy Trình Thiết Kế & Hiện Thực Hoá UX/UI

Khi người dùng cung cấp liên kết Figma (URL file, frame, hoặc node) hoặc yêu cầu thiết kế giao diện cho hệ thống Book Management:

## 1. Thu Thập & Phân Tích Dữ Liệu Thiết Kế (Figma MCP)
1. Xác định thông tin từ URL Figma:
   - Trích xuất `fileKey` và `nodeId` từ link (ví dụ: `https://www.figma.com/design/<fileKey>/<name>?node-id=<nodeId>`).
2. Sử dụng các công cụ Figma MCP phù hợp:
   - `get_design_context`: Lấy thông tin ngữ cảnh layout, cấu trúc cây DOM, Auto Layout (Flexbox: flex-direction, gap, padding, align-items, justify-content).
   - `get_screenshot`: Lấy hình ảnh thực tế của frame/node để đối chiếu trực quan về khoảng cách và thẩm mỹ.
   - `get_variable_defs`: Đọc danh sách biến màu (Color tokens), Spacing tokens và Typography tokens từ Figma file.
   - `get_comments`: Đọc các ghi chú thiết kế, spec hoặc yêu cầu đặc biệt của designer nếu có.

## 2. Đối Chiếu Hệ Thống Nhận Diện Dự Án (Design System Grounding)
Luôn đồng bộ thiết kế với quy chuẩn của **Book Management** (tham chiếu `GEMINI.md`):
- **Bảng màu chủ đạo (Color Palette)**:
  - Màu thương hiệu chính: Tông nâu vàng thư viện ấm áp (`#8A5A1E` / `amber-800`), dùng cho nút hành động chính (Primary Button), viền active, icon điểm nhấn.
  - Màu nền: Trắng ngà, kem hoặc xám siêu nhạt (`bg-stone-50` / `bg-amber-50/20`), phân biệt rõ với card/bảng trắng tinh (`bg-white`).
  - Màu văn bản: Đen than (`#1c1917` / `stone-900`) cho tiêu đề, xám đậm (`stone-600`) cho văn bản phụ, đảm bảo tỷ lệ tương phản tối thiểu 4.5:1 (WCAG AA).
- **Bộ Icon**: Ưu tiên 100% sử dụng thư viện `lucide-react` đã cài sẵn thay vì cắt ảnh bitmap/SVG rời không cần thiết.
- **Thư viện & Công nghệ**:
  - React 19 + TypeScript.
  - Tailwind CSS v4 (sử dụng class tiện ích chuẩn, không viết CSS inline).
  - Quản lý biểu mẫu: `react-hook-form` + `zod` resolver (schema đặt tại `client/src/schemas/`).
  - Quản lý server state: `@tanstack/react-query` (custom hook đặt tại `client/src/hooks/`).

## 3. Đánh Giá & Phản Biện Trải Nghiệm Người Dùng (UX Review)
Trước khi sinh mã, AI phải chủ động rà soát và đề xuất giải pháp cho các vấn đề UX:
1. **Bao phủ các trạng thái (State Coverage)**:
   - **Ready**: Giao diện hiển thị đầy đủ dữ liệu.
   - **Loading**: Skeleton loading hoặc spinner thanh lịch, giữ nguyên khung hình tránh giật layout (CLS).
   - **Empty State**: Khi chưa có sách, chưa có danh mục, hoặc chưa có phiếu mượn (kèm icon minh họa & nút CTA tạo mới).
   - **Error State**: Thông báo lỗi rõ ràng, giải thích nguyên nhân và có nút thử lại (Retry).
2. **Khả năng đáp ứng (Responsive Design)**:
   - Bố cục co giãn mượt mà từ Mobile (`<640px`), Tablet (`768px`) đến Desktop (`>=1024px`).
   - Bảng dữ liệu phức tạp trên mobile cần chuyển sang dạng thẻ (Card view) hoặc cuộn ngang mượt mà.
3. **Khả năng tiếp cận & Thao tác (Accessibility & Ergonomics)**:
   - Tất cả nút hành động (Button, Link, Input) có vùng bấm (hit target) tối thiểu 44x44px trên thiết bị cảm ứng.
   - Hỗ trợ điều hướng bằng phím Tab và hiển thị rõ trạng thái `focus-visible`.
   - Các nút chỉ chứa icon phải có `aria-label` hoặc `title`.

## 4. Hiện Thực Mã Nguồn (Code Implementation)
- Tổ chức theo thư mục chuẩn:
  - Thành phần giao diện dùng chung: `client/src/components/`
  - Màn hình/Trang: `client/src/pages/`
  - Logic nghiệp vụ mượn/trả/sách: `client/src/features/`
- Đảm bảo kiểm tra đầy đủ type với TypeScript interfaces/types tương ứng trong `client/src/types/`.
