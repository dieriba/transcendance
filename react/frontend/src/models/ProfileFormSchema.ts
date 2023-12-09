import {
  MAX_NICKNAME_LENGTH,
  MIN_NICKNAME_LENGTH,
} from "./../../shared/error.message.constant";
import { z } from "zod";

export const ProfileFormSchema = z.object({
  nickname: z
    .string()
    .min(MIN_NICKNAME_LENGTH)
    .max(MAX_NICKNAME_LENGTH)
    .optional(),
  fullname: z.string().optional(),
  name: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string(),
});

export type ProfileFormType = z.infer<typeof ProfileFormSchema>;

export const ProfileSchema = z.object({
  avatar: z.string().min(1).optional().nullable(),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
});

export type ProfileType = z.infer<typeof ProfileSchema>;
