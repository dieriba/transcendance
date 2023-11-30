import { z } from "zod";
import { VALID_UPLOADS_MIME_TYPES } from "../../shared/constant";

export const MAX_FILE_SIZE = 5000000;

export const UploadAvatarSchema = z.object({
  avatar: z
    .any()
    .refine((files) => files?.length == 1, { message: "Image is required." })
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, {
      message: `Max file size is 5MB.`,
    })
    .refine((files) => VALID_UPLOADS_MIME_TYPES.includes(files?.[0]?.type), {
      message: ".jpg, .jpeg, .png and .webp files are accepted.",
    }),
});

export type UploadAvatarType = z.infer<typeof UploadAvatarSchema>;
