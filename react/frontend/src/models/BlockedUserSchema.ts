import { z } from "zod";
import { BaseUserInfoSchema, BaseUserSchema } from "./login/UserSchema";

export const BlockedUserSchema = BaseUserInfoSchema;

export type BlockedUserType = z.infer<typeof BlockedUserSchema>;

export const BlockedUserForChatroom = BaseUserSchema;
