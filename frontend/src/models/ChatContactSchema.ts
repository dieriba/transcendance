import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";

export const messageTypes = ["IMAGE", "DOCUMENT", "REPLY", "TEXT"];

export const UserSchemaWithProfile = z
  .object({
    id: z.string(),
    nickname: z.string(),
    status: z.enum(["OFFLINE", "ONLINE", "PLAYING"]),
  })
  .merge(ProfileSchema);

export type UserWithProfile = z.infer<typeof UserSchemaWithProfile>;

export const MessageSchema = z.object({
  id: z.string(),
  chatroomId: z.string().min(1),
  userId: z.string(),
  content: z.string(),
  messageTypes: z.enum(["IMAGE", "DOCUMENT", "REPLY", "TEXT"]),
});

export type MessageType = z.infer<typeof MessageSchema>;

export const MessageFormSchema = z.object({
  friendId: z.string().optional(),
  chatroomId: z.string().optional(),
  content: z.string().min(1).trim(),
  messageTypes: z.enum(["IMAGE", "DOCUMENT", "REPLY", "TEXT"]).optional(),
});

export type MessageFormType = z.infer<typeof MessageFormSchema>;

export const PrivateChatroomSchema = z.object({
  id: z.string(),
  users: z.array(
    z.object({
      user: UserSchemaWithProfile,
    })
  ),
  messages: z.array(MessageSchema),
  updatedAt: z.date().optional(),
});

export type PrivateChatroomType = z.infer<typeof PrivateChatroomSchema>;
