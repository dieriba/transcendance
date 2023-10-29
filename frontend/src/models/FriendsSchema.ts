import { z } from "zod";

export const BaseFriendSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(1),
});

export type BaseFriendType = z.infer<typeof BaseFriendSchema>;

export const FriendsChatSchema = BaseFriendSchema.extend({
  online: z.boolean(),
});

export type FriendsChatType = z.infer<typeof FriendsChatSchema>;
