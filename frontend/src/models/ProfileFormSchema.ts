import { z } from "zod";

export const ProfileFormSchema = z.object({
  nickname: z.string().min(3).optional(),
  fullname: z.string().optional(),
  name: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string(),
});

export type ProfileFormType = z.infer<typeof ProfileFormSchema>;
