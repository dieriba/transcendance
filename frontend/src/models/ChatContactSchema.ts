import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  status: z.enum(["OFFLINE", "ONLINE", "PLAYING"]),
});

const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.date(),
});

export const PrivateChatroomSchema = z.object({
  id: z.string(),
  isPinned: z.boolean(),
  users: z.array(
    z.object({
      user: userSchema,
    })
  ),
  messages: z.array(messageSchema),
});

export type PrivateChatroomType = z.infer<typeof PrivateChatroomSchema>;
