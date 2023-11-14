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

export const restrictionType = ["MUTED", "KICKED", "BANNED"] as const;
export type RestrictionType = "MUTED" | "KICKED" | "BANNED";

export const durationUnit = ["MIN", "HOURS", "DAYS"] as const;
export type DurationUnitType = "MIN" | "HOURS" | "DAYS";

export const statusTypes = ["ONLINE", "OFFLINE", "PLAYING"] as const;
export type StatusType = "ONLINE" | "OFFLINE" | "PLAYING";


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

export enum Restriction {
  MUTED = "MUTED",
  KICKED = "KICKED",
  BANNED = "BANNED",
}

export enum DurationUnit {
  MIN = "MIN",
  HOURS = "HOURS",
  DAYS = "DAYS",
}

export enum STATUS {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  PLAYING = "PLAYING",
}
