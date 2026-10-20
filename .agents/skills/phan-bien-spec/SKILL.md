---
name: phan-bien-spec
description: >-
  Phản biện rồi cập nhật docs/spec.md trước khi viết code. Dùng khi người dùng
  lên ý tưởng sản phẩm, muốn thêm hoặc đổi một tính năng, đổi dữ liệu hay quyền
  của người dùng, hoặc gõ /phan-bien-spec. Không dùng khi người dùng nhờ sửa lỗi,
  đổi giao diện nhỏ, hoặc đã có spec rõ và chỉ yêu cầu viết code.
---

# Phản biện spec

Không viết code, không tạo bảng dữ liệu trong lúc chạy skill này.

1. Đọc docs/spec.md (nếu có), GEMINI.md hoặc CLAUDE.md, và phần code liên quan.
   Điều gì tự tra được thì tra, không hỏi người dùng.
2. Hỏi từng câu một, mỗi câu kèm đề xuất của bạn. Thứ tự:
   phạm vi MVP → dữ liệu & vai trò → tiêu chí hoàn thành → trường hợp biên.
3. Thấy chỗ mơ hồ hoặc mâu thuẫn với spec cũ hay code thì nói thẳng và đề xuất cách sửa.
4. Khi người dùng nói "chốt": cập nhật docs/spec.md theo khung trong
   [mau-spec.md](./resources/mau-spec.md), chỉ sửa phần liên quan.
   Điều chưa chốt được thì ghi vào mục "Câu hỏi còn mở".
5. Liệt kê phần vừa đổi trong docs/spec.md, nhắc người dùng đọc lại rồi commit.

Viết tiếng Việt, ít thuật ngữ. Thuật ngữ bắt buộc thì giải nghĩa ngắn lần đầu.
