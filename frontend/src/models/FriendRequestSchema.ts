import { z } from "zod";

export const FriendRequestSchema = z.object({
  nickname: z.string().min(1),
});

export type FriendRequestType = z.infer<typeof FriendRequestSchema>;
