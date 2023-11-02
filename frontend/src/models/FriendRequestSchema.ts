import { z } from "zod";

export const FriendRequestSchema = z.object({
  nickname: z.string().min(1),
});

export const ServerResponseFriendReceivedRequestSchema = z.object({
  sender: z.object({
    id: z.string().min(1),
    nickname: z.string().min(1),
    profile: z.object({
      avatar: z.string().min(1),
    }),
  }),
});

export const ServerResponseFriendSentRequestSchema = z.object({
  recipient: z.object({
    id: z.string().min(1),
    nickname: z.string().min(1),
    profile: z.object({
      avatar: z.string().min(1),
    }),
  }),
});

export type FriendRequestType = z.infer<typeof FriendRequestSchema>;

export type ServerResponseFriendReceivedRequestType = z.infer<
  typeof ServerResponseFriendReceivedRequestSchema
>;

export type ServerResponseFriendSentRequestType = z.infer<
  typeof ServerResponseFriendSentRequestSchema
>;

export type FriendSentRequestType = z.infer<
  typeof ServerResponseFriendSentRequestSchema
>;
