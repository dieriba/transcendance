import { z } from "zod";
import { BaseUserSchema, UserSchema } from "./UserSchema";
import { AccessTokenSchema } from "./AccessTokenSchema";
import { ProfileSchema } from "../ProfileFormSchema";

export const ResponseLoginSchema = AccessTokenSchema.extend({
  user: UserSchema.merge(ProfileSchema),
});

export type ResponseLoginType = z.infer<typeof ResponseLoginSchema>;

export const ResponseTwoFaLoginSchema = BaseUserSchema.extend({
  twoFa: z.boolean(),
});

export type ResponseTwoFaLoginType = z.infer<typeof ResponseTwoFaLoginSchema>;
