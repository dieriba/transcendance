import { z } from "zod";
import {
  ERR_MSG_MAXIMUM_PASSWORD_LENGTH,
  ERR_MSG_MINIMUM_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../shared/error.message.constant";

export const RegisterSchema = z
  .object({
    lastname: z.string(),
    firstname: z.string(),
    email: z.string().email().trim(),
    nickname: z.string().min(3),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        message: ERR_MSG_MINIMUM_PASSWORD_LENGTH,
      })
      .max(MAX_PASSWORD_LENGTH, { message: ERR_MSG_MAXIMUM_PASSWORD_LENGTH }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormType = z.infer<typeof RegisterSchema>;
