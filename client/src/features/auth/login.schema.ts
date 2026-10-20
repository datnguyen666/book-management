import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  portal: z.enum(["MEMBER", "MANAGEMENT"]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
