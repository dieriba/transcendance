import { z } from "zod";
import { BaseUserInfoSchema } from "./login/UserSchema";

export const FriendRequestSchema = z.object({
  nickname: z.string().min(1),
});

export type FriendRequestType = z.infer<typeof FriendRequestSchema>;

export const FriendReceivedRequestSchema = z.object({
  sender: BaseUserInfoSchema,
});

export type FriendReceivedRequestType = z.infer<
  typeof FriendReceivedRequestSchema
>;

export const FriendSentRequestSchema = z.object({
  recipient: BaseUserInfoSchema,
});

export type FriendSentRequestType = z.infer<typeof FriendSentRequestSchema>;
