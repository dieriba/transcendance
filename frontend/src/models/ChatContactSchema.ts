import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";
import { BaseFriendSchema } from "./FriendsSchema";

export const UserSchemaWithProfile = z
  .object({
    id: z.string(),
    nickname: z.string(),
    status: z.enum(["OFFLINE", "ONLINE", "PLAYING"]),
  })
  .merge(ProfileSchema);

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
  userId: z.string(),
  content: z.string(),
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
      user: UserSchemaWithProfile,
    })
  ),
  messages: z.array(MessageSchema),
  updatedAt: z.date().optional(),
});

export type PrivateChatroomType = z.infer<typeof PrivateChatroomSchema>;
