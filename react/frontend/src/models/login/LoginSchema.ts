import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email().trim(),
  password: z
    .string()
    .min(2, { message: "Password must be 8 or more characters" }),
});

export type LoginFormType = z.infer<typeof LoginSchema>;
