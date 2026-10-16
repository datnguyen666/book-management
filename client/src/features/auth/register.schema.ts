import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Họ và tên tối thiểu 2 ký tự"),
    username: z
      .string()
      .trim()
      .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới"),
    email: z.string().trim().email("Địa chỉ email không hợp lệ"),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^[0-9+() -]{8,15}$/.test(val),
        "Số điện thoại không hợp lệ",
      ),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
