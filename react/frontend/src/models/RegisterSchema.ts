import { z } from "zod";

export const RegisterSchema = z
  .object({
    lastname: z.string(),
    firstname: z.string(),
    email: z.string().email().trim(),
    nickname: z.string().min(3),
    password: z
      .string()
      .min(8, { message: "Password must be 8 or more characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormType = z.infer<typeof RegisterSchema>;
