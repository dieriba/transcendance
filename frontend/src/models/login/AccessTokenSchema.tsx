import { z } from "zod";

export const AccessTokenSchema = z.object({
  access_token: z.string().min(1),
});

export type AccessTokenType = z.infer<typeof AccessTokenSchema>;
