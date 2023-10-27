import { z } from "zod";

export const OauthSchema = z.object({
  nickname: z.string().min(3),
  code: z.string().min(1).optional(),
});

export type OauthFormType = z.infer<typeof OauthSchema>;
