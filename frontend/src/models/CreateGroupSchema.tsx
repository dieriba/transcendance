import { z } from "zod";

const groupTypes = ["PUBLIC", "PRIVATE", "PROTECTED"] as const;

export const CreateGroupSchema = z.object({
  chatroomName: z.string().min(3).trim(),
  users: z
    .string()
    .array()
    .length(1, { message: "You need to have at least 1 user to create a group" }),
  type: z.enum(groupTypes),
  password: z
    .string()
    .min(8, { message: "Password must be 8 or more characters" })
    .optional(),
});

export type CreateGroupFormType = z.infer<typeof CreateGroupSchema>;
