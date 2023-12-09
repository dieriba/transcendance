import { z } from "zod";
import { BaseNickname, BaseUserInfoSchema } from "./login/UserSchema";

export const FriendRequestSchema = BaseNickname;

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
