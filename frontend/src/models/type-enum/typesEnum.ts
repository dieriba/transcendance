export const groupTypes = ["PUBLIC", "PRIVATE", "PROTECTED"] as const;
export type GroupTypes = "PUBLIC" | "PRIVATE" | "PROTECTED";

export const messageTypes = ["IMAGE", "DOCUMENT", "REPLY", "TEXT"] as const;
export type MessageTYpes = "IMAGE" | "DOCUMENT" | "REPLY" | "TEXT";

export const friendsType = ["ONLINE", "OFFLINE", "PLAYING"] as const;
export type FriendsType = "ONLINE" | "OFFLINE" | "PLAYING";

export const privilegeRoleType = ["DIERIBA", "CHAT_ADMIN"] as const;
export type PrivilegeRoleType = "DIERIBA" | "CHAT_ADMIN";

export const roleType = ["DIERIBA", "CHAT_ADMIN", "REGULAR_USER"] as const;
export type ChatRoleType = "DIERIBA" | "CHAT_ADMIN" | "REGULAR_USER";

export enum GroupTypeEnum {
  PUBLIC = "PUBLIC",
  PROTECTED = "PROTECTED",
  PRIVATE = "PRIVATE",
}

export enum ROLE {
  DIERIBA = "DIERIBA",
  CHAT_ADMIN = "CHAT_ADMIN",
  REGULAR_USER = "REGULAR_USER",
}
