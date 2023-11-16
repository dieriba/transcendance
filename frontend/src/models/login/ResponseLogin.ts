import { z } from "zod";
import { UserSchema } from "./UserSchema";
import { AccessTokenSchema } from "./AccessTokenSchema";
import { ProfileSchema } from "../ProfileFormSchema";

export const ResponseLoginSchema = AccessTokenSchema.extend({
  user: UserSchema.merge(ProfileSchema),
});

export type ResponseLoginType = z.infer<typeof ResponseLoginSchema>;
