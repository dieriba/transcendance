import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";

export const MessageGroupSchema = z.object({
  id: z.string().min(1),
  chatroomId: z.string().min(1),
  user: z
    .object({ id: z.string().min(1), nickname: z.string().min(1) })
    .merge(ProfileSchema),
  content: z.string().min(1),
  messageTypes: z.string().min(1),
});

export type MessageGroupType = z.infer<typeof MessageGroupSchema>;

export const ChatroomGroupSchema = z.object({
  id: z.string().min(1),
  chatroomName: z.string().min(1),
  type: z.enum(["PROTECTED", "PUBLIC", "PRIVATE"]),
  messages: z.array(MessageGroupSchema),
});

export type ChatroomGroupType = z.infer<typeof ChatroomGroupSchema>;