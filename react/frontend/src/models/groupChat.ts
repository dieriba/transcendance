import { z } from "zod";
import { ProfileSchema } from "./ProfileFormSchema";
import { UserSchemaWithProfile } from "./ChatContactSchema";
import {
  durationUnit,
  groupTypes,
  privilegeRoleType,
  restrictionType,
  roleType,
} from "./type-enum/typesEnum";
import { BaseSchema } from "./BaseType";
import {
  BAN_LIFE_VALUE,
  BAN_MAX_DAYS,
  KICK_MAX_DAYS,
  KICK_MAX_HOURS,
  KICK_MAX_MIN,
  MUTE_MAX_DAYS,
  MUTE_MAX_HOURS,
  MUTE_MAX_MIN,
} from "../../shared/restriction.constant";
import { BaseFriendSchema } from "./FriendsSchema";

export const BaseChatroomIdSchema = z.object({
  chatroomId: z.string().min(1),
});

export type BaseChatroomTypeId = z.infer<typeof BaseChatroomIdSchema>;

export const BaseChatroomSchema = z.object({
  id: z.string().min(1),
  chatroomName: z.string().min(1),
  type: z.enum(groupTypes),
});

export type BaseChatroomType = z.infer<typeof BaseChatroomSchema>;

export const BaseChatroomWithUserIdSchema = BaseChatroomIdSchema.extend({
  id: z.string().min(1),
  role: z.enum(roleType).optional(),
});

export type BaseChatroomWithUserIdType = z.infer<
  typeof BaseChatroomWithUserIdSchema
>;

export const MessageGroupSchema = z.object({
  id: z.string().min(1),
  chatroomId: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    nickname: z.string().min(1),
    profile: ProfileSchema,
  }),
  content: z.string().min(1),
  createdAt: z.date(),
});

export const MessageGroupFormSchema = z.object({
  id: z.string().min(1).optional(),
  chatroomId: z.string().min(1).optional(),
  content: z.string().min(1).trim(),
});

export type MessageGroupFormType = z.infer<typeof MessageGroupFormSchema>;

export type MessageGroupType = z.infer<typeof MessageGroupSchema>;

export const JoinableChatroomSchema = BaseChatroomSchema;

export type JoinableChatroomType = z.infer<typeof JoinableChatroomSchema>;

export const GroupInvitation = z.object({
  chatroom: BaseChatroomSchema,
});

export type GroupInvitation = z.infer<typeof GroupInvitation>;

export const RestrictedUserInGroupSchema = z.object({
  restriction: z.enum(restrictionType),
  restrictionTimeEnd: z.date(),
  reason: z.string().min(1),
  banLife: z.boolean().optional(),
  admin: z.object({
    user: z.object({
      nickname: z.string().min(1),
    }),
    role: z.string().min(1).optional(),
  }),
});

export type RestrictedUserInGroupType = z.infer<typeof RestrictedGroupSchema>;

export const RestrictedUserResponseSchema = BaseChatroomIdSchema.merge(
  RestrictedUserInGroupSchema
);

export type RestrictedUserResponseType = z.infer<
  typeof RestrictedUserResponseSchema
>;

export const UnrestrictSchema = z.object({
  message: z.array(MessageGroupSchema),
  chatroomId: z.string().min(1),
  restriction: z.enum(restrictionType),
});

export type UnrestrictType = z.infer<typeof UnrestrictSchema>;

export const ChatroomGroupSchema = JoinableChatroomSchema.extend({
  restrictedUsers: z.array(RestrictedUserInGroupSchema),
  messages: z.array(MessageGroupSchema),
});

export type ChatroomGroupType = z.infer<typeof ChatroomGroupSchema>;

export const JoinProtectedGroupSchema = z.object({
  password: z.string().min(8),
});

export type JoinProtectedGroupFormType = z.infer<
  typeof JoinProtectedGroupSchema
>;

export const RestrictedGroupSchema = z.object({
  admin: z.object({
    user: z.object({
      nickname: z.string().min(1),
    }),
    role: z.enum(privilegeRoleType),
  }),
  reason: z.string().min(1),
  restriction: z.string().min(1),
  restrictionTimeEnd: z.date(),
});

export type RestrictedGroupType = z.infer<typeof RestrictedGroupSchema>;

export const UserGroupSchema = z.object({
  user: UserSchemaWithProfile.extend({
    restrictedGroups: z.array(RestrictedGroupSchema),
    friends: z.array(BaseFriendSchema),
    friendRequestsSent: z.array(z.object({ senderId: z.string().min(1) })),
    friendRequestsReceived: z.array(
      z.object({ recipientId: z.string().min(1) })
    ),
  }),
  role: z.enum(roleType),
});

export const InvitedUserSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    nickname: z.string().min(1),
    profile: z.object({ avatar: z.string().min(1) }),
  }),
});

export type InvitedUserType = z.infer<typeof InvitedUserSchema>;

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

export const RestrictUserFormSchema = z
  .object({
    id: z.string().optional(),
    chatroomId: z.string().optional(),
    restriction: z.enum(restrictionType),
    duration: z.coerce.number(),
    durationUnit: z.enum(durationUnit),
    reason: z.string().min(1).max(255),
  })
  .superRefine((data, ctx) => {
    if (data.duration < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duration must at least 1",
        path: ["duration"],
      });
    }

    if (data.restriction === "MUTED") {
      if (data.durationUnit === "MIN" && data.duration > MUTE_MAX_MIN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A user can be muted at most ${MUTE_MAX_MIN} minutes`,
          path: ["duration"],
        });
      }

      if (data.durationUnit === "HOURS" && data.duration > MUTE_MAX_HOURS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A user can be muted at most ${MUTE_MAX_HOURS} hours`,
          path: ["duration"],
        });
      }

      if (data.durationUnit === "DAYS" && data.duration > MUTE_MAX_DAYS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A user can be muted at most ${MUTE_MAX_DAYS} days`,
          path: ["duration"],
        });
      }
    } else if (data.restriction === "KICKED") {
      if (data.durationUnit === "MIN" && data.duration > KICK_MAX_MIN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A user can be muted at most ${KICK_MAX_MIN} minutes`,
          path: ["duration"],
        });
      }

      if (data.durationUnit === "HOURS" && data.duration > KICK_MAX_HOURS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A user can be muted at most ${KICK_MAX_HOURS} hours`,
          path: ["duration"],
        });
      }

      if (data.durationUnit === "DAYS" && data.duration > KICK_MAX_DAYS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A user can be muted at most ${KICK_MAX_DAYS} days`,
          path: ["duration"],
        });
      }
    } else {
      if (
        data.durationUnit === "DAYS" &&
        data.duration !== BAN_LIFE_VALUE &&
        data.duration > BAN_MAX_DAYS
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A user can be muted at most ${BAN_MAX_DAYS} days`,
          path: ["duration"],
        });
      }
    }
    return z.never;
  });

export type RestrictUserType = z.infer<typeof RestrictUserFormSchema>;

export const PreviousAdminLeaveSchema = z.object({
  newAdminId: z.string().min(1),
  newAdminPreviousRole: z.enum(roleType),
});

export type PreviousAdminLeaveType = z.infer<typeof PreviousAdminLeaveSchema>;

export const AddNewUserToGroupSchema = z.object({
  users: z.array(z.string()).min(1),
  chatroomId: z.string().optional(),
});

export type AddNewUserToGroupType = z.infer<typeof AddNewUserToGroupSchema>;

export const InviteUserToGroupSchema = z.object({
  nickname: z.string().min(1),
  chatroomId: z.string().optional(),
});

export type InviteUserToGroupType = z.infer<typeof InviteUserToGroupSchema>;
