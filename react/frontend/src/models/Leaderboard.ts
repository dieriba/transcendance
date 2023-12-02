import { BaseUserSchema } from "./login/UserSchema";
import { z } from "zod";
import { UserSchemaWithProfile } from "./ChatContactSchema";

export const LeaderboardSchema = UserSchemaWithProfile.extend({
  friends: z.array(BaseUserSchema),
  blockedBy: z.array(BaseUserSchema),
  blockedUsers: z.array(BaseUserSchema),
});

export type LeaderboardType = z.infer<typeof LeaderboardSchema>;
