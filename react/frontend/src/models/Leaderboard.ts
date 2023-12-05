import { z } from "zod";
import { UserSchemaWithProfile } from "./ChatContactSchema";
import { BaseSchema } from "./BaseType";

export const LeaderboardSchema = UserSchemaWithProfile.extend({
  friends: z.array(BaseSchema),
  blockedBy: z.array(BaseSchema),
  blockedUsers: z.array(BaseSchema),
});

export type LeaderboardType = z.infer<typeof LeaderboardSchema>;
