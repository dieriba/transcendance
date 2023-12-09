import { z } from "zod";
import { groupTypes } from "./type-enum/typesEnum";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../shared/error.message.constant";

export const EditGroupSchema = z
  .object({
    chatroomId: z.string().optional(),
    type: z.enum(groupTypes),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH)
      .max(MAX_PASSWORD_LENGTH)
      .optional(),
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

export type EditGroupType = z.infer<typeof EditGroupSchema>;

export const editGroupResponseSchema = z.object({
  chatroomId: z.string().min(1),
  type: z.enum(groupTypes),
});

export type editGroupResponseType = z.infer<typeof editGroupResponseSchema>;
