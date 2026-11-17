import { z } from "zod";

export const createStaffSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên nhân viên")
    .max(100, "Họ và tên không được vượt quá 100 ký tự"),

  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Địa chỉ email không đúng định dạng"),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;
