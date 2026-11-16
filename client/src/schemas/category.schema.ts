import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên thể loại")
    .max(100, "Tên thể loại không được vượt quá 100 ký tự"),

  description: z
    .string()
    .trim()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
