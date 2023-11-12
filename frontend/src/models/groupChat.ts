import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";
import { UserSchemaWithProfile } from "./ChatContactSchema";
import { groupTypes, messageTypes, roleType } from "./type-enum/typesEnum";
import { BaseSchema } from "./BaseType";

export const MessageGroupSchema = z.object({
  id: z.string().min(1),
  chatroomId: z.string().min(1),
  user: z
    .object({ id: z.string().min(1), nickname: z.string().min(1) })
    .merge(ProfileSchema),
  content: z.string().min(1),
  messageTypes: z.string().min(1),
});

export const MessageGroupFormSchema = z.object({
  id: z.string().min(1).optional(),
  chatroomId: z.string().min(1).optional(),
  content: z.string().min(1).trim(),
  messageTypes: z.enum(messageTypes).optional(),
});

export type MessageGroupFormType = z.infer<typeof MessageGroupFormSchema>;

export type MessageGroupType = z.infer<typeof MessageGroupSchema>;

export const JoinableChatroomSchema = z.object({
  id: z.string().min(1),
  chatroomName: z.string().min(1),
  type: z.enum(groupTypes),
});

export type JoinableChatroomType = z.infer<typeof JoinableChatroomSchema>;

export const ChatroomGroupSchema = JoinableChatroomSchema.extend({
  messages: z.array(MessageGroupSchema),
});

export type ChatroomGroupType = z.infer<typeof ChatroomGroupSchema>;

export const JoinProtectedGroupSchema = z.object({
  password: z.string().min(8),
});

export type JoinProtectedGroupFormType = z.infer<
  typeof JoinProtectedGroupSchema
>;

export const UserGroupSchema = z.object({
  user: UserSchemaWithProfile,
  role: z.enum(roleType),
});

export type UserGroupType = z.infer<typeof UserGroupSchema>;

export const GroupMembersSchema = z.object({
  users: z.array(UserGroupSchema),
  role: z.enum(roleType),
});

export type GroupMembertype = z.infer<typeof GroupMembersSchema>;

export const SetNewRoleSchema = z.object({
  id: z.string().min(1),
  chatroomId: z.string().min(1),
  chatroomName: z.string().min(1),
  role: z.enum(roleType).optional(),
});

export type SetNewRoleType = z.infer<typeof SetNewRoleSchema>;

export const UserNewRoleResponseSchema = BaseSchema.extend({
  role: z.enum(roleType),
});

export type UserNewRoleResponseType = z.infer<typeof UserNewRoleResponseSchema>;
