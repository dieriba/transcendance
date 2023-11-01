import { z } from "zod";

export const FriendRequestSchema = z.object({
  nickname: z.string().min(1),
});

export const ServerResponseFriendRequestSchema = z.object({
  createdAt: z.date(),
});

export const ServerResponseFriendReceivedRequestSchema =
  ServerResponseFriendRequestSchema.extend({
    sender: z.object({
      id: z.string().min(1),
      nickname: z.string().min(1),
    }),
  });

export const ServerResponseFriendSentRequestSchema =
  ServerResponseFriendRequestSchema.extend({
    recipient: z.object({
      id: z.string().min(1),
      nickname: z.string().min(1),
    }),
  });

export type FriendRequestType = z.infer<typeof FriendRequestSchema>;

export type ServerResponseFriendRequestType = z.infer<
  typeof ServerResponseFriendRequestSchema
>;
export type ServerResponseFriendReceivedRequestType = z.infer<
  typeof ServerResponseFriendReceivedRequestSchema
>;

export type ServerResponseFriendSentRequestType = z.infer<
  typeof ServerResponseFriendSentRequestSchema
>;

export type FriendSentRequestType = z.infer<
  typeof ServerResponseFriendSentRequestSchema
>;
