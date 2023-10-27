import { z } from "zod";
import { UserSchema } from "./UserSchema";
import { AccessTokenSchema } from "./AccessTokenSchema";

export const ResponseLoginSchema = AccessTokenSchema.extend({
  user: UserSchema,
});

export type ResponseLoginType = z.infer<typeof ResponseLoginSchema>;
