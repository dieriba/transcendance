import { z } from "zod";

export const PongSchema = z.object({
  victory: z.number().nonnegative(),
  losses: z.number().nonnegative(),
  rating: z.number().nonnegative(),
});

export type PongType = z.infer<typeof PongSchema>;
