import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";

export const FriendRequestSchema = z.object({
  nickname: z.string().min(1),
});

export type FriendRequestType = z.infer<typeof FriendRequestSchema>;

export const FriendReceivedRequestSchema = z.object({
  sender: z
    .object({
      id: z.string().min(1),
      nickname: z.string().min(1),
    })
    .merge(ProfileSchema),
});

export type FriendReceivedRequestType = z.infer<
  typeof FriendReceivedRequestSchema
>;

export const FriendSentRequestSchema = z.object({
  recipient: z
    .object({
      id: z.string().min(1),
      nickname: z.string().min(1),
    })
    .merge(ProfileSchema),
});

export type FriendSentRequestType = z.infer<typeof FriendSentRequestSchema>;
