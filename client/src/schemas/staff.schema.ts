import { z } from "zod";

export const createStaffSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name is too long"),

  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;
