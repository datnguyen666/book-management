# Khung docs/spec.md

Giữ đúng 6 mục và thứ tự này. Ví dụ in nghiêng chỉ để minh hoạ, thay bằng nội dung thật.

## 1. Sản phẩm & người dùng

Giải quyết vấn đề gì, cho ai. *Ví dụ: Shop hoa nhận đơn qua Zalo bị sót đơn; chủ shop và 2 nhân viên cần một nơi ghi đơn chung.*

## 2. Phạm vi MVP

* **Làm:** *nhận đơn, xem đơn của mình, admin xem tất cả đơn.*
* **Cố tình chưa làm:** *thanh toán online, giao hàng.*

## 3. Tính năng

Mỗi tính năng có vài câu "Khi … thì …" kiểm chứng được.

### Đặt đơn

* *Khi khách để trống số điện thoại thì form báo lỗi, không gửi được.*
* *Khi gửi đơn thành công thì đơn hiện ngay trong danh sách đơn của khách đó.*

## 4. Dữ liệu & vai trò

| Loại dữ liệu | Mỗi dòng thuộc về ai | Nối với |
|---|---|---|
| *Đơn hàng* | *Khách đã đặt* | *Khách hàng, Sản phẩm* |

| Vai trò | Xem | Thêm | Sửa | Xoá |
|---|---|---|---|---|
| *Khách* | *Đơn của mình* | *Có* | *Đơn của mình khi chưa xác nhận* | *Không* |
| *Admin* | *Tất cả* | *Có* | *Tất cả* | *Tất cả* |

## 5. Trường hợp biên

*Danh sách rỗng, nhập sai định dạng, chưa đăng nhập, mất mạng giữa chừng.*

## 6. Câu hỏi còn mở

*Những điều chưa chốt. Chốt xong thì chuyển lên đúng mục ở trên.*
