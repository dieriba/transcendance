import { z } from "zod";
import { BaseNickname } from "./UserSchema";

export const OauthSchema = BaseNickname.extend({
  code: z.string().min(1).optional(),
});

export type OauthFormType = z.infer<typeof OauthSchema>;
