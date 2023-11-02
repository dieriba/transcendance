import { z } from "zod";

export const BlockedUserSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(1),
  profile: z.object({ avatar: z.string() }),
});

export type BlockedUserType = z.infer<typeof BlockedUserSchema>;
