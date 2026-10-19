# Hướng Dẫn Dự Án Book Management (GEMINI.md)

Tài liệu tóm tắt toàn bộ kiến trúc, tech stack, quy trình phát triển, các lệnh vận hành phổ biến và quy ước lập trình cho dự án **Book Management**.

---

## 1. Giới Thiệu & Tổng Quan Dự Án

**Book Management** là hệ thống quản lý thư viện sách toàn diện (Full-stack Web Application), phục vụ việc quản lý sách, danh mục, tài khoản nhân viên/bạn đọc, quy trình mượn/trả sách, kiểm soát hạn trả và tính toán giá trị tài sản sách trong thư viện.

- **Mô hình dự án**: Monorepo dạng Client - Server chạy song song.
- **Môi trường cục bộ**: Hỗ trợ HTTPS hoàn chỉnh cho cả Client và Server bằng chứng chỉ SSL nội bộ (`server/certs/`).
- **Phân quyền (RBAC)**: 3 vai trò chính:
  - `ADMIN`: Toàn quyền hệ thống, quản lý nhân viên (`STAFF`), xem báo cáo, quản lý danh mục, sách, phiếu mượn và tài sản.
  - `STAFF`: Quản lý kho sách, thể loại, duyệt yêu cầu mượn/trả sách của bạn đọc, theo dõi sách quá hạn.
  - `MEMBER`: Bạn đọc/người dùng mượn sách, tra cứu sách và xem lịch sử mượn trả cá nhân.

---

## 2. Tech Stack Chi Tiết

### 2.1 Backend (`/server`)
- **Framework**: [NestJS](https://nestjs.com/) (v11.x) trên nền Node.js & TypeScript.
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) (v17) kết hợp [Prisma ORM](https://www.prisma.io/) (v6.x).
- **Authentication & Security**:
  - [Passport](http://www.passportjs.org/) + [Passport JWT](http://www.passportjs.org/packages/passport-jwt/) + `@nestjs/jwt`.
  - [bcrypt](https://www.npmjs.com/package/bcrypt) để hash mật khẩu.
  - Role-based Access Control (RBAC) thông qua Guards & Custom Decorators.
- **Validation & Serialization**: `class-validator`, `class-transformer`.
- **API Documentation**: [Swagger / OpenAPI](https://swagger.io/) (`@nestjs/swagger`, `swagger-ui-express`).
- **File Storage**: [Multer](https://github.com/expressjs/multer) upload ảnh bìa sách cục bộ vào thư mục `uploads/`, phục vụ static file qua `@nestjs/serve-static`.
- **Email Service**: [Nodemailer](https://nodemailer.com/) hỗ trợ luồng kích hoạt tài khoản nhân viên, thiết lập mật khẩu và khôi phục mật khẩu.

### 2.2 Frontend (`/client`)
- **Framework & Tooling**: [React](https://react.dev/) (v19.x) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/) (v8.x).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4.x) tích hợp qua `@tailwindcss/vite`.
- **Routing**: [React Router](https://reactrouter.com/) (v7.x) với các lớp bảo vệ route (`ProtectedRoute`, `RoleRoute`, `GuestRoute`).
- **State Management**:
  - **Server State**: [@tanstack/react-query](https://tanstack.com/query/latest) (v5.x).
  - **Client State**: [Zustand](https://github.com/pmndrs/zustand) (v5.x) hỗ trợ `persist` lưu trữ phiên đăng nhập vào `localStorage`.
- **Form Handling & Validation**: [React Hook Form](https://react-hook-form.com/) (v7.x) kết hợp [Zod](https://zod.dev/) (v4.x).
- **HTTP Client**: [Axios](https://axios-http.com/) với Interceptor tự động gắn token `Bearer` và xử lý điều hướng khi `401 Unauthorized`.
- **UI Components & Icons**: [Lucide React](https://lucide.dev/).
- **Export & Reporting**: `xlsx` (xuất báo cáo Excel), `pdfmake` (xuất phiếu / báo cáo PDF).

### 2.3 DevOps & Hạ tầng
- **Docker & Docker Compose**: Khởi tạo cơ sở dữ liệu PostgreSQL 17 độc lập.
- **HTTPS nội bộ**: Chứng chỉ tự ký tại `server/certs/localhost.pem` và `server/certs/localhost-key.pem` áp dụng cho cả NestJS lẫn Vite dev server.

---

## 3. Cấu Trúc Thư Mục Dự Án

```text
book-management/
├── .gitignore
├── README.md
├── GEMINI.md                       # Tài liệu hướng dẫn & quy ước dự án
├── docker-compose.yml              # Dịch vụ PostgreSQL
├── package.json                    # Root package (quản lý scripts đồng thời)
├── book_management_backup.dump     # File backup dữ liệu DB mẫu
│
├── server/                         # Ảo hóa & Backend API (NestJS)
│   ├── certs/                      # Chứng chỉ SSL (localhost.pem, localhost-key.pem)
│   ├── prisma/
│   │   ├── schema.prisma           # Định nghĩa cấu trúc Database & Relations
│   │   ├── migrations/             # Lịch sử các bản migration database
│   │   └── seed.ts                 # Dữ liệu khởi tạo tài khoản mặc định (admin/staff)
│   ├── prisma.config.ts            # Cấu hình đường dẫn schema & migration
│   ├── uploads/                    # Lưu trữ ảnh bìa sách do người dùng tải lên
│   ├── src/
│   │   ├── main.ts                 # Điểm khởi động NestJS, bật HTTPS, CORS, Swagger
│   │   ├── app.module.ts           # Root Module
│   │   ├── prisma/                 # PrismaService & PrismaModule
│   │   ├── auth/                   # Xác thực, JWT Strategy, Guard, Role Decorator
│   │   ├── staff/                  # Quản lý nhân viên, active/deactivate, gửi mail
│   │   ├── category/               # Quản lý danh mục thể loại sách
│   │   ├── book/                   # Quản lý sách, tồn kho, ảnh bìa
│   │   ├── borrow/                 # Quản lý phiếu mượn/trả, gia hạn, duyệt phiếu
│   │   ├── dashboard/              # Thống kê tổng hợp số liệu thư viện
│   │   ├── asset/                  # Tính toán giá trị tài sản sách trong kho / đang mượn
│   │   ├── mail/                   # Module gửi email qua SMTP
│   │   └── common/                 # Cấu hình dùng chung (Multer, Filters, v.v.)
│   ├── test/                       # Unit test & e2e test
│   ├── package.json
│   └── tsconfig.json
│
└── client/                         # Giao diện người dùng (React + Vite)
    ├── .env                        # Chứa VITE_API_ORIGIN=https://localhost:3000
    ├── vite.config.ts              # Cấu hình Vite, HTTPS, alias (@ -> ./src), Tailwind
    ├── package.json
    ├── src/
    │   ├── main.tsx                # Mount ứng dụng vào DOM
    │   ├── App.tsx                 # Khởi tạo AppRouter
    │   ├── api/                    # Gọi API Axios theo từng thực thể
    │   ├── components/             # Reusable UI & Layouts (Sidebar, Header, Layout)
    │   ├── features/               # Thành phần logic nghiệp vụ chuyên sâu
    │   ├── hooks/                  # React Query custom hooks (use-books, use-borrow,...)
    │   ├── pages/                  # Các trang màn hình theo chức năng
    │   │   ├── auth/               # Đăng nhập, đăng ký, đổi/quên mật khẩu
    │   │   ├── dashboard/          # Bảng điều khiển thống kê
    │   │   ├── book/               # Danh sách và chi tiết sách
    │   │   ├── category/           # Quản lý thể loại
    │   │   ├── borrow/             # Quản lý mượn trả (Staff & Member)
    │   │   ├── assets/             # Báo cáo giá trị tài sản
    │   │   ├── staff/              # Quản lý danh sách nhân viên
    │   │   └── profile/            # Thông tin tài khoản cá nhân
    │   ├── routes/                 # Định tuyến, bảo vệ route (ProtectedRoute, RoleRoute)
    │   ├── store/                  # Zustand Store (auth.store.ts)
    │   ├── schemas/                # Zod schemas cho validation biểu mẫu
    │   ├── types/                  # TypeScript interface / types
    │   └── utils/                  # Hỗ trợ xuất file Excel/PDF (asset-export.ts)
```

---

## 4. Cơ Sở Dữ Liệu & Prisma Schema

Cơ sở dữ liệu được tổ chức chặt chẽ quanh các mô hình chính trong `server/prisma/schema.prisma`:

1. **Enum Role**: `ADMIN`, `STAFF`, `MEMBER`.
2. **Enum BorrowStatus**: `PENDING`, `BORROWING`, `RETURNED`, `REJECTED`, `CANCELLED`.
3. **User**:
   - Quản lý tài khoản Admin, Nhân viên và Bạn đọc (Thành viên).
   - Mã thẻ bạn đọc: `memberCode` (duy nhất).
   - Cờ đổi mật khẩu: `mustChangePassword`, cùng token hash và thời hạn phục vụ kích hoạt tài khoản/quên mật khẩu (`passwordSetupTokenHash`, `passwordResetTokenHash`).
4. **Category**: Phân loại danh mục sách (quan hệ 1-n với `Book`).
5. **Book**:
   - Lưu thông tin chi tiết: `title`, `isbn` (unique), `author`, `publisher`, `publishedDate`, `price` (Decimal), `coverImage`.
   - Quản lý kho: `quantity` (tổng số lượng nhập) và `borrowedQuantity` (số lượng đang được mượn). Số sách sẵn sàng mượn = `quantity - borrowedQuantity`.
   - Index trên `title`, `author`, `categoryId` để tối ưu tìm kiếm.
6. **BorrowRecord**:
   - Lưu thông tin người mượn: `borrowerName`, `borrowerCode`, `userId` (quan hệ tùy chọn với User), sách mượn `bookId`.
   - Trạng thái mượn và hạn trả: `borrowedAt`, `dueDate`, `returnedAt`, `status`, `notes`, `rejectReason`, `renewCount`.
   - Nhân viên xử lý phiếu: `processedById` (quan hệ với User vai trò STAFF/ADMIN).

---

## 5. Các Lệnh Build / Run / Test / Migration Phổ Biến

### 5.1 Khởi động Hạ Tầng (Docker Database)
Trước khi chạy ứng dụng, cần bật container PostgreSQL:
```bash
# Bật database ở chế độ chạy nền
docker compose up -d

# Tắt database
docker compose down

# Khôi phục dữ liệu từ file dump (nếu cần):
# docker exec -i book-management-db pg_restore -U postgres -d book_management < book_management_backup.dump
```

### 5.2 Khởi Chạy Toàn Dự Án Từ Thư Mục Gốc (Root)
Tại thư mục gốc `book-management/`:
```bash
# Cài đặt dependencies cho cả root, client và server (nếu mới clone)
npm install
npm install --prefix server
npm install --prefix client

# Chạy song song cả Vite Client (https://localhost:5173) và NestJS Server (https://localhost:3000)
npm run dev
```

### 5.3 Lệnh Dành Riêng Cho Backend (`/server`)
Di chuyển vào thư mục `server`:
```bash
cd server

# Cài đặt dependencies
npm install

# Khởi chạy chế độ phát triển (watch mode)
npm run start:dev

# Khởi chạy chế độ debug
npm run start:debug

# Build ứng dụng sang dist/
npm run build

# Chạy bản build production
npm run start:prod

# Kiểm tra & sửa lỗi cú pháp / format
npm run lint
npm run format

# Chạy Tests
npm run test           # Chạy unit tests
npm run test:watch     # Chạy test watch mode
npm run test:cov       # Chạy test tính coverage
npm run test:e2e       # Chạy end-to-end test
```

### 5.4 Lệnh Quản Trị Cơ Sở Dữ Liệu Với Prisma (`/server`)
```bash
cd server

# Tạo migration mới khi thay đổi schema và áp dụng vào DB
npx prisma migrate dev --name <ten_migration>

# Áp dụng các migration đang chờ lên database (không tạo migration mới)
npx prisma migrate deploy

# Đồng bộ schema trực tiếp vào DB mà không tạo file migration (dành cho prototype)
npx prisma db push

# Chạy seed dữ liệu tài khoản mặc định (Admin: admin/Admin@123, Staff: staff/Staff@123)
npm run db:seed
# Hoặc:
npx prisma db seed

# Mở giao diện trực quan Prisma Studio để tra cứu và chỉnh sửa dữ liệu
npx prisma studio

# Sinh lại Prisma Client sau khi sửa schema.prisma
npx prisma generate
```

### 5.5 Lệnh Dành Riêng Cho Frontend (`/client`)
Di chuyển vào thư mục `client`:
```bash
cd client

# Cài đặt dependencies
npm install

# Khởi chạy Vite dev server (mặc định tại https://localhost:5173)
npm run dev

# Kiểm tra type và build production vào dist/
npm run build

# Preview bản build production
npm run preview

# Kiểm tra linting với ESLint
npm run lint
```

---

## 6. Các Quy Ước Code Quan Trọng (Coding Conventions)

### 6.1 Giao Tiếp & Giao Thức Mạng (HTTPS & CORS)
- **HTTPS là bắt buộc trong môi trường local**: Cả client và server đều yêu cầu đọc chứng chỉ từ `server/certs/`. Khi chạy lần đầu, hãy chắc chắn rằng chứng chỉ `localhost.pem` đã được tạo hoặc tin cậy trong hệ điều hành/trình duyệt.
- **CORS & Global Prefix**:
  - Toàn bộ API của server bắt đầu với tiền tố: `/api/v1/`.
  - Swagger UI truy cập tại: `https://localhost:3000/docs`.
  - Client giao tiếp với server thông qua URL gốc cấu hình trong `.env`: `VITE_API_ORIGIN=https://localhost:3000`.

### 6.2 Quy Ước Backend (NestJS)
1. **Kiến trúc phân tầng chuẩn**:
   - `Module`: Đăng ký Controller, Provider/Service, Module phụ thuộc và exports.
   - `Controller`: Chỉ nhận HTTP Request, gọi Service và trả về Response. Áp dụng `@ApiTags`, `@ApiOperation`, `@ApiResponse` cho Swagger.
   - `Service`: Chứa toàn bộ nghiệp vụ xử lý dữ liệu và tương tác trực tiếp với `PrismaService`.
   - `DTO (Data Transfer Object)`:
     - Bắt buộc kiểm tra dữ liệu đầu vào bằng `class-validator` (`@IsNotEmpty`, `@IsString`, `@IsInt`, `@Min`, `@IsDateString`).
     - Chuyển đổi kiểu bằng `class-transformer` (`@Type(() => Number)`).
     - Định nghĩa mô tả trường cho Swagger bằng `@ApiProperty` hoặc `@ApiPropertyOptional`.
2. **Bảo mật & Phân quyền**:
   - Sử dụng `@UseGuards(JwtAuthGuard)` ở cấp độ Controller hoặc Endpoint để bảo vệ route.
   - Khi cần giới hạn theo vai trò, kết hợp `@UseGuards(RolesGuard)` cùng decorator `@Roles(Role.ADMIN, Role.STAFF)`.
3. **Xử lý ngoại lệ (Exception Handling)**:
   - Dùng các HTTP Exception có sẵn của NestJS: `BadRequestException`, `NotFoundException`, `ConflictException`, `ForbiddenException`.
   - Bắt lỗi Prisma cụ thể (`error instanceof Prisma.PrismaClientKnownRequestError`):
     - Ví dụ: mã `P2002` bắn ra `ConflictException('Tên hoặc mã này đã tồn tại')`.
4. **Xử lý tập tin (File Upload)**:
   - Sử dụng cấu hình `multerOptions` trong `src/common/upload/multer.config.ts`.
   - Chỉ cho phép các định dạng: `.jpg`, `.jpeg`, `.png`, `.webp`, `.jfif`. Giới hạn dung lượng tối đa: 5MB.
   - File tải lên được lưu trong thư mục `server/uploads/` và phục vụ qua route tĩnh `/uploads/<filename>`.

### 6.3 Quy Ước Frontend (React + Vite)
1. **Cấu trúc Component & Hook**:
   - Tận dụng Custom Hooks kết hợp React Query (`useQuery`, `useMutation`) trong thư mục `src/hooks/` để cô lập logic fetch dữ liệu khỏi giao diện.
   - Đặt tên query key nhất quán dạng mảng: `["books", params]`, `["borrow-records", filters]`, `["categories"]`.
   - Sau khi Mutation thành công (thêm, sửa, xóa), luôn gọi `queryClient.invalidateQueries(...)` để cập nhật dữ liệu mới nhất.
2. **Quản lý Form & Validation**:
   - Sử dụng `react-hook-form` tích hợp resolver từ `zod` (`@hookform/resolvers/zod`).
   - Định nghĩa schema Zod trong thư mục `src/schemas/` để đảm bảo tính tái sử dụng và kiểm soát type an toàn.
3. **Quản lý State & Token (Zustand)**:
   - `useAuthStore` lưu `accessToken` và đối tượng `user` vào `localStorage` qua middleware `persist`.
   - Axios Interceptor sẽ tự động đọc token từ `useAuthStore.getState().accessToken` và đính kèm vào header `Authorization: Bearer <token>`.
   - Khi gặp mã lỗi `401 Unauthorized`, tự động gọi `logout()` và xóa state lưu trữ.
4. **Quy chuẩn Styling**:
   - Sử dụng Tailwind CSS v4.
   - Màu sắc theo chủ đề sách & thư viện: tông vàng nâu thanh lịch (`#8A5A1E`), trắng ngà và xám tinh tế.
   - Thống nhất các thành phần giao diện dùng chung: Modal, Button, Table, Badge trạng thái nằm trong `src/components/`.

---

## 7. Tài Khoản Khởi Tạo Mặc Định (Seed Data)

Sau khi chạy lệnh `npm run db:seed` ở thư mục `server`, hệ thống có sẵn 2 tài khoản thử nghiệm:

| Vai Trò | Username | Mật Khẩu | Email |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (ADMIN)** | `admin` | `Admin@123` | `admin@book.local` |
| **Nhân Viên (STAFF)** | `staff` | `Staff@123` | `staff@book.local` |
