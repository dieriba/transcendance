import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(3),
  isTwoFaEnabled: z.boolean(),
});

export type BaseUserType = z.infer<typeof UserSchema>;

export const BaseUserSchema = z.object({
  id: z.string().min(1),
});

export type BaseUserTypeId = z.infer<typeof BaseUserSchema>;
