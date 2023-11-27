import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";
import { friendsType } from "./type-enum/typesEnum";
import { PongSchema } from "./PongSchema";

export const BaseFriendSchema = z.object({
  friendId: z.string().min(1),
});

export type BaseFriendType = z.infer<typeof BaseFriendSchema>;

export const FriendsChatSchema = BaseFriendSchema.extend({
  online: z.boolean(),
});

export const FriendSchema = z.object({
  friend: z
    .object({
      id: z.string().min(1),
      nickname: z.string().min(1),
      status: z.enum(friendsType),
      pong: PongSchema.nullable(),
    })
    .merge(ProfileSchema),
});

export type FriendType = z.infer<typeof FriendSchema>;

export type FriendsChatType = z.infer<typeof FriendsChatSchema>;
