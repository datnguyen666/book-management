# Đặc tả yêu cầu kỹ thuật (spec.md)

## 1. Sản phẩm & người dùng

Hệ thống Quản lý Thư viện sách (Book Management) phục vụ 2 nhóm người dùng chính:
* **Bạn đọc (`MEMBER`)**: Độc giả, sinh viên có nhu cầu tra cứu và gửi yêu cầu mượn/trả sách.
* **Ban quản lý (`ADMIN`, `STAFF`)**: Cán bộ quản trị và nhân viên thủ thư phụ trách quản lý danh mục, kho sách, duyệt phiếu mượn/trả, quản lý bạn đọc và kiểm kê tài sản.

**Vấn đề giải quyết:** 
1. Màn hình đăng nhập cần phân tách rõ ràng cổng vào cho Bạn đọc và Ban quản lý.
2. Ban quản lý (Admin và Staff) chưa có nơi tập trung để tra cứu danh sách độc giả, xem hồ sơ cá nhân và theo dõi toàn bộ lịch sử mượn/trả sách của từng bạn đọc khi làm việc tại quầy thư viện.

---

## 2. Phạm vi MVP

* **Làm:**
  * **Cổng đăng nhập theo vai trò:** Chuyển đổi giữa cổng "Bạn đọc" và "Ban quản lý" tại `/login`.
  * **Tab Quản lý Bạn đọc (`/members`):**
    * Thêm mục "Bạn đọc" trên thanh điều hướng bên trái dành cho Admin và Staff (nhóm menu Quản lý).
    * Danh sách bạn đọc hiển thị: Mã bạn đọc (`memberCode`), họ tên, email, số điện thoại, trạng thái hoạt động (`isActive`), số lượng sách đang mượn.
    * Tìm kiếm bạn đọc theo: Họ tên, mã thẻ bạn đọc, email, số điện thoại.
    * Xem chi tiết bạn đọc: Bấm vào một bạn đọc để xem thông tin hồ sơ cá nhân và bảng toàn bộ lịch sử mượn/trả sách của người đó (tên sách, ngày mượn, hạn trả, ngày trả, trạng thái phiếu).
    * Khóa / Mở khóa tài khoản bạn đọc (`isActive`) để xử lý các trường hợp bạn đọc vi phạm quy chế mượn sách.
* **Cố tình chưa làm:**
  * Admin/Staff tạo tài khoản bạn đọc thủ công từ giao diện nội bộ (bạn đọc tự đăng ký tài khoản từ trang ngoài).
  * Chỉnh sửa thông tin cá nhân của bạn đọc từ phía quản trị (bạn đọc tự cập nhật ở trang cá nhân).
  * Xuất danh sách bạn đọc hoặc xuất phiếu lý lịch bạn đọc ra Excel/PDF.

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

### 3.3. Quản lý Bạn đọc (Member)
* Khi Admin hoặc Staff truy cập menu "Bạn đọc", hệ thống tải và hiển thị danh sách các tài khoản có vai trò `MEMBER`.
* Khi nhập từ khóa tìm kiếm (tên, mã thẻ, email, số điện thoại), bảng danh sách lọc kết quả tương ứng.
* Khi bấm vào một dòng bạn đọc trong danh sách, hệ thống mở giao diện chi tiết hiển thị đầy đủ thông tin cá nhân (họ tên, mã bạn đọc, email, số điện thoại, ngày tham gia, trạng thái) cùng danh sách toàn bộ phiếu mượn sách của người đó.
* Khi thực hiện thao tác "Khóa tài khoản" với bạn đọc đang hoạt động, hệ thống yêu cầu xác nhận rồi cập nhật trạng thái `isActive = false`, đồng thời hiển thị thông báo thành công.
* Khi thực hiện thao tác "Mở khóa tài khoản" với bạn đọc đang bị khóa, hệ thống cập nhật trạng thái `isActive = true`.

---

## 4. Dữ liệu & vai trò

| Loại dữ liệu | Mỗi dòng thuộc về ai | Nối với |
|---|---|---|
| Người dùng (`User`) | Bản thân người dùng sở hữu | Phiếu mượn (`BorrowRecord`) |
| Phiếu mượn (`BorrowRecord`) | Thuộc về Bạn đọc mượn sách | Người dùng (`User`), Sách (`Book`), Người duyệt (`User`) |

| Vai trò | Xem | Thêm | Sửa | Xoá |
|---|---|---|---|---|
| **Bạn đọc (`MEMBER`)** | Hồ sơ của mình, phiếu mượn của mình | Tự đăng ký tài khoản, gửi yêu cầu mượn | Sửa hồ sơ cá nhân, đổi mật khẩu | Không |
| **Nhân viên (`STAFF`)** | Xem tất cả sách, thể loại, phiếu mượn, danh sách & chi tiết bạn đọc | Tạo phiếu mượn tại quầy | Khóa/mở khóa bạn đọc, duyệt/trả sách | Không |
| **Quản trị viên (`ADMIN`)** | Xem toàn bộ hệ thống (báo cáo, nhân viên, sách, bạn đọc, phiếu mượn) | Tạo nhân viên, sách, thể loại | Khóa/mở khóa bạn đọc & nhân viên, sửa cấu hình | Xóa dữ liệu cho phép |

---

## 5. Trường hợp biên

* **Bạn đọc chưa có lịch sử mượn:** Khu vực lịch sử mượn sách hiển thị trạng thái trống thân thiện *"Chưa có lịch sử mượn sách"*.
* **Bạn đọc có sách quá hạn chưa trả:** Trong danh sách chi tiết mượn, làm nổi bật trạng thái "Quá hạn" bằng nhãn cảnh báo đỏ để thủ thư nhận biết ngay lập tức.
* **Tài khoản bị khóa (`isActive = false`):** Khi bị khóa, bạn đọc không thể đăng nhập hoặc yêu cầu mượn sách mới. Khi đăng nhập sẽ nhận thông báo: *"Tài khoản đã bị tạm khóa. Vui lòng liên hệ ban quản lý thư viện."*
* **Tài khoản nhân viên chưa kích hoạt mật khẩu (`mustChangePassword = true`):** Chuyển hướng đến trang thiết lập mật khẩu mới (`/set-password`).
* **Truy cập trái phép trang `/members`:** Nếu tài khoản có vai trò `MEMBER` cố tình truy cập vào `/members`, hệ thống chặn quyền và điều hướng về trang cho phép (như `/books`).
* **Tìm kiếm không có kết quả:** Hiển thị thông báo *"Không tìm thấy bạn đọc nào phù hợp với từ khóa tìm kiếm."*
* **Mất kết nối mạng:** Hiển thị thông báo *"Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng."*

---

## 6. Câu hỏi còn mở

* **Hình thức hiển thị chi tiết bạn đọc:** Nên sử dụng trang riêng biệt (`/members/:id`) hay dùng bảng trượt (drawer) / modal bật lên ngay trên trang danh sách để thuận tiện tra cứu nhanh? *(Đề xuất: Sử dụng trang riêng `/members/:id` để có không gian hiển thị bảng lịch sử mượn sách đầy đủ cột và phân trang dễ dàng).*
* **Phân quyền thao tác khóa tài khoản:** Có nên cho phép cả `STAFF` bấm Khóa / Mở khóa thẻ bạn đọc khi phát hiện vi phạm tại quầy, hay chỉ giới hạn riêng cho `ADMIN`? *(Đề xuất: Cho phép cả `ADMIN` và `STAFF` khóa thẻ bạn đọc để xử lý kịp thời khi có vi phạm).*
