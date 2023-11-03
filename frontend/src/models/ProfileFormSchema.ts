import { z } from "zod";

export const ProfileFormSchema = z.object({
  nickname: z.string().min(3).optional(),
  fullname: z.string().optional(),
  name: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string(),
});

export const ProfileSchema = z.object({
  profile: z.object({
    avatar: z.string().min(1).optional(),
  }),
});

export type ProfileFormType = z.infer<typeof ProfileFormSchema>;
