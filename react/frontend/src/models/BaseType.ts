import { z } from "zod";

export const BaseSchema = z.object({
  id: z.string().min(1),
});

export type Basetype = z.infer<typeof BaseSchema>;
