import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";
import { BaseUserSchema } from "./login/UserSchema";

export const BlockedUserSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(1),
  profile: ProfileSchema,
});

export type BlockedUserType = z.infer<typeof BlockedUserSchema>;

export const BlockedUserForChatroom = BaseUserSchema;
