import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(3),
  twoFa: z.boolean(),
  allowForeignToDm: z.boolean(),
});

export type BaseUserType = z.infer<typeof UserSchema>;

export const BaseUserSchema = z.object({
  id: z.string().min(1),
});

export type BaseUserTypeId = z.infer<typeof BaseUserSchema>;

export const UpdateUserSchema = z.object({
  nickname: z.string().min(1),
});

export type UpdateUserType = z.infer<typeof UpdateUserSchema>;

export type UserUpdated = UpdateUserType & BaseUserTypeId;

export type UpdatedAvatarRes = BaseUserTypeId & { avatar: string };

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    password: z
      .string()
      .min(8, { message: "Password must be 8 or more characters" }),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords don't match",
      });
    }

    if (data.currentPassword === data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "New password must be different from current password",
      });
    }

    return z.NEVER;
  });

export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;

export const OtpSchema = z.object({
  qrCode: z.string().min(1),
  otpTempSecret: z.string().min(1),
});

export type OtpType = z.infer<typeof OtpSchema>;

export const ValidateOtpSchema = z.object({
  token: z.string().min(1),
});

export type ValidateOtpType = z.infer<typeof ValidateOtpSchema>;