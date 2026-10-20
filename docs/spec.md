# Đặc tả yêu cầu kỹ thuật (spec.md)

## 1. Sản phẩm & người dùng

Hệ thống Quản lý Thư viện sách (Book Management) phục vụ 2 nhóm người dùng chính:
* **Bạn đọc (`MEMBER`)**: Độc giả, sinh viên có nhu cầu tra cứu và gửi yêu cầu mượn/trả sách.
* **Ban quản lý (`ADMIN`, `STAFF`)**: Cán bộ quản trị và nhân viên thủ thư phụ trách quản lý danh mục, kho sách, duyệt phiếu mượn/trả và kiểm kê tài sản.

**Vấn đề giải quyết:** Hiện tại màn hình đăng nhập dùng chung một form duy nhất, gây nhầm lẫn về quyền hạn và luồng đăng ký (nhân viên không được tự đăng ký bên ngoài nhưng lại thấy liên kết đăng ký độc giả). Cần tách bạch giao diện thành 2 cổng đăng nhập chuyên biệt để tăng tính rõ ràng và nâng cao trải nghiệm người dùng.

---

## 2. Phạm vi MVP

* **Làm:**
  * Tại trang đăng nhập (`/login`), thêm 2 nút chọn lớn trực quan để chuyển đổi giữa 2 cổng:
    * **"Bạn đọc thư viện" (User/Member)**
    * **"Ban quản lý & Nhân viên" (Admin/Staff)**
  * Cổng **Bạn đọc**: Form đăng nhập cho độc giả, có liên kết chuyển sang trang Đăng ký tài khoản độc giả (`/register`) và Quên mật khẩu.
  * Cổng **Ban quản lý**: Form đăng nhập dành riêng cho Admin/Staff, **ẩn hoàn toàn** liên kết Đăng ký (vì tài khoản nhân viên do Admin tạo trong nội bộ). Có chức năng Quên mật khẩu.
  * Kiểm soát vai trò khi đăng nhập: Chỉ cho phép tài khoản có vai trò tương ứng đăng nhập vào đúng cổng đã chọn; nếu đăng nhập nhầm cổng sẽ hiển thị thông báo hướng dẫn cụ thể.
  * Chuyển hướng sau đăng nhập: Bạn đọc được điều hướng về danh sách sách (`/books`), Ban quản lý được điều hướng về Bảng điều khiển (`/dashboard`).
* **Cố tình chưa làm:**
  * Chức năng tự đăng ký tài khoản cho Nhân viên và Admin từ ngoài giao diện.
  * Tách riêng 2 đường dẫn URL khác nhau (vẫn dùng chung URL `/login` với nút chuyển đổi cổng để tinh gọn).

---

## 3. Tính năng

### 3.1. Chuyển đổi cổng đăng nhập
* Khi người dùng truy cập trang `/login`, hệ thống mặc định hiển thị cổng "Bạn đọc thư viện".
* Khi bấm vào nút "Ban quản lý & Nhân viên", form chuyển sang chế độ đăng nhập quản trị và ẩn liên kết Đăng ký độc giả.
* Khi bấm vào nút "Bạn đọc thư viện", form chuyển sang chế độ đăng nhập độc giả và hiển thị liên kết Đăng ký tài khoản.

### 3.2. Đăng nhập theo vai trò
* Khi tài khoản có vai trò `MEMBER` đăng nhập tại cổng Ban quản lý: hệ thống từ chối đăng nhập và báo lỗi *"Tài khoản độc giả không thể đăng nhập tại cổng Ban quản lý. Vui lòng chuyển sang cổng Bạn đọc."*
* Khi tài khoản có vai trò `ADMIN` hoặc `STAFF` đăng nhập tại cổng Bạn đọc: hệ thống từ chối đăng nhập và báo lỗi *"Tài khoản ban quản lý không thể đăng nhập tại cổng Bạn đọc. Vui lòng chuyển sang cổng Quản trị."*
* Khi nhập sai tên đăng nhập hoặc mật khẩu: hệ thống báo lỗi *"Tên đăng nhập hoặc mật khẩu không chính xác."*
* Khi đăng nhập thành công ở cổng Bạn đọc: lưu phiên đăng nhập và chuyển hướng đến trang `/books`.
* Khi đăng nhập thành công ở cổng Ban quản lý: lưu phiên đăng nhập và chuyển hướng đến trang `/dashboard`.

---

## 4. Dữ liệu & vai trò

| Loại dữ liệu | Mỗi dòng thuộc về ai | Nối với |
|---|---|---|
| Người dùng (`User`) | Bản thân người dùng sở hữu | Phiếu mượn (`BorrowRecord`) |

| Vai trò | Xem | Thêm | Sửa | Xoá |
|---|---|---|---|---|
| **Bạn đọc (`MEMBER`)** | Hồ sơ cá nhân của mình | Đăng ký tài khoản độc giả mới | Thông tin cá nhân, đổi mật khẩu | Không |
| **Nhân viên (`STAFF`)** | Hồ sơ cá nhân của mình | Không tự tạo tài khoản ngoài trang đăng nhập | Thông tin cá nhân, đổi mật khẩu | Không |
| **Quản trị viên (`ADMIN`)** | Danh sách tất cả tài khoản | Tạo tài khoản nhân viên trong trang nội bộ | Mở/khóa tài khoản, sửa thông tin | Không |

---

## 5. Trường hợp biên

* **Tài khoản bị khóa (`isActive = false`)**: Khi đăng nhập đúng cổng nhưng tài khoản bị khóa, hệ thống báo lỗi: *"Tài khoản đã bị tạm khóa. Vui lòng liên hệ ban quản lý thư viện."*
* **Tài khoản nhân viên chưa kích hoạt mật khẩu (`mustChangePassword = true`)**: Sau khi đăng nhập bằng mật khẩu tạm, hệ thống bắt buộc chuyển hướng đến trang thiết lập mật khẩu mới (`/set-password`).
* **Truy cập trực tiếp đường dẫn `/register`**: Trang đăng ký chỉ cho phép tạo tài khoản có vai trò `MEMBER`, không có lựa chọn đăng ký làm nhân viên hay quản trị viên.
* **Người dùng gõ thông tin rồi đổi cổng**: Giữ trường nhập thông tin hoặc dọn sạch ô nhập liệu và xóa thông báo lỗi cũ để tránh bối rối.
* **Mất kết nối mạng**: Hiển thị thông báo *"Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng."*

---

## 6. Câu hỏi còn mở

* **Cơ chế xác thực cổng ở Backend**: API đăng nhập `POST /api/v1/auth/login` nên nhận thêm tham số vai trò mong muốn (`portal: 'MANAGEMENT' | 'MEMBER'`) để kiểm tra và chặn ngay từ máy chủ, hay chỉ cần frontend kiểm tra vai trò sau khi nhận thông tin đăng nhập? *(Đề xuất: Nên gửi thêm tham số lên máy chủ để đảm bảo an toàn tuyệt đối, tránh bị gọi thẳng API).*
