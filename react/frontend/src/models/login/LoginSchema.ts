import { z } from "zod";
import {
  ERR_MSG_MAXIMUM_PASSWORD_LENGTH,
  ERR_MSG_MINIMUM_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../../shared/error.message.constant";

export const LoginSchema = z.object({
  email: z.string().email().trim(),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: ERR_MSG_MINIMUM_PASSWORD_LENGTH })
    .max(MAX_PASSWORD_LENGTH, { message: ERR_MSG_MAXIMUM_PASSWORD_LENGTH }),
});

export type LoginFormType = z.infer<typeof LoginSchema>;
