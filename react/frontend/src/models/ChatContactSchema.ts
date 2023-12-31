import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";
import { BaseFriendSchema } from "./FriendsSchema";
import { PongSchema } from "./PongSchema";
import { BaseUserInfoSchema } from "./login/UserSchema";
import {
  MAX_MESSAGE_LENGTH,
  MIN_MESSAGE_LENGTH,
} from "../../shared/error.message.constant";

export const UserSchemaWithProfile = BaseUserInfoSchema.extend({
  status: z.enum(["OFFLINE", "ONLINE", "PLAYING"]),
  pong: PongSchema.nullable(),
  profile: ProfileSchema,
});

export type UserWithProfile = z.infer<typeof UserSchemaWithProfile>;

export const UserWithProfileFriendsSchema = UserSchemaWithProfile.extend({
  friends: z.array(BaseFriendSchema),
  friendRequestsSent: z.array(z.object({ senderId: z.string().min(1) })),
  friendRequestsReceived: z.array(z.object({ recipientId: z.string().min(1) })),
});

export type UserWithProfileFriendsType = z.infer<
  typeof UserWithProfileFriendsSchema
>;

export const UserSchemaProfileBanLife = UserWithProfileFriendsSchema.extend({
  banLife: z.boolean(),
});

export type UserProfileBanLifeType = z.infer<typeof UserSchemaProfileBanLife>;

export const MessageSchema = z.object({
  id: z.string(),
  chatroomId: z.string().min(1),
  content: z.string().min(MIN_MESSAGE_LENGTH).max(MAX_MESSAGE_LENGTH),
  createdAt: z.date(),
  user: UserSchemaWithProfile,
});

export type MessageType = z.infer<typeof MessageSchema>;

export const MessageFormSchema = z.object({
  friendId: z.string().optional(),
  chatroomId: z.string().optional(),
  content: z.string().min(1).trim(),
});

export type MessageFormType = z.infer<typeof MessageFormSchema>;

export const PrivateChatroomSchema = z.object({
  id: z.string(),
  users: z.array(
    z.object({
      user: UserWithProfileFriendsSchema,
    })
  ),
  messages: z.array(MessageSchema),
  updatedAt: z.date().optional(),
});

export type PrivateChatroomType = z.infer<typeof PrivateChatroomSchema>;
