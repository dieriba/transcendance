import { z } from "zod";

const groupTypes = ["PUBLIC", "PRIVATE", "PROTECTED"] as const;

export const CreateGroupSchema = z
  .object({
    chatroomName: z.string().min(3).trim(),
    users: z.array(z.string()).optional(),
    type: z.enum(groupTypes),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PROTECTED") {
      if (data.password === undefined || data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be 8 or more characters for protected groups",
          path: ["password"],
        });
      }
    }

    if (
      data.type !== "PROTECTED" &&
      data.password !== undefined &&
      data.password.length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is only allowed for protected groups",
        path: ["password"],
      });
    }

    return z.NEVER;
  });

export type CreateGroupFormType = z.infer<typeof CreateGroupSchema>;
