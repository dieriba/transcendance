import { z } from "zod";
import { UserSchema } from "./UserSchema";
import { AccessTokenSchema } from "./AccessTokenSchema";
import { ProfileSchema } from "../ProfileFormSchema";
import { BaseSchema } from "../BaseType";

export const ResponseLoginSchema = AccessTokenSchema.extend({
  user: UserSchema.extend({ profile: ProfileSchema, oauth: z.boolean() }),
});

export type ResponseLoginType = z.infer<typeof ResponseLoginSchema>;

export const ResponseTwoFaLoginSchema = BaseSchema.extend({
  twoFa: z.boolean(),
});

export type ResponseTwoFaLoginType = z.infer<typeof ResponseTwoFaLoginSchema>;
