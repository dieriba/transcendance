import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";

export const BlockedUserSchema = z
  .object({
    id: z.string().min(1),
    nickname: z.string().min(1),
  })
  .merge(ProfileSchema);

export type BlockedUserType = z.infer<typeof BlockedUserSchema>;
