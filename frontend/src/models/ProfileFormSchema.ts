import { z } from "zod";

export const ProfileFormSchema = z.object({
  nickname: z.string().min(3).optional(),
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
