import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";

export enum GroupTypeEnum {
  PUBLIC = "PUBLIC",
  PROTECTED = "PROTECTED",
  PRIVATE = "PRIVATE",
}

export const MessageGroupSchema = z.object({
  id: z.string().min(1),
  chatroomId: z.string().min(1),
  user: z
    .object({ id: z.string().min(1), nickname: z.string().min(1) })
    .merge(ProfileSchema),
  content: z.string().min(1),
  messageTypes: z.string().min(1),
  blockedBy: z.array(z.object({ id: z.string() })),
});

export const MessageGroupFormSchema = z.object({
  id: z.string().min(1).optional(),
  chatroomId: z.string().min(1).optional(),
  content: z.string().min(1).trim(),
  messageTypes: z.enum(["IMAGE", "DOCUMENT", "REPLY", "TEXT"]).optional(),
});

export type MessageGroupFormType = z.infer<typeof MessageGroupFormSchema>;

export type MessageGroupType = z.infer<typeof MessageGroupSchema>;

export const ChatroomGroupSchema = z.object({
  id: z.string().min(1),
  chatroomName: z.string().min(1),
  type: z.enum(["PROTECTED", "PUBLIC", "PRIVATE"]),
  messages: z.array(MessageGroupSchema),
});

export type ChatroomGroupType = z.infer<typeof ChatroomGroupSchema>;
