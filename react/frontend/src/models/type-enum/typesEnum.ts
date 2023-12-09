export const groupTypes = ["PUBLIC", "PRIVATE", "PROTECTED"] as const;
export type GroupTypes = typeof groupTypes[number];

export const friendsType = ["ONLINE", "OFFLINE", "PLAYING"] as const;
export type FriendsType = typeof friendsType[number];

export const privilegeRoleType = ["DIERIBA", "CHAT_ADMIN"] as const;
export type PrivilegeRoleType = typeof privilegeRoleType[number];

export const roleType = ["DIERIBA", "CHAT_ADMIN", "REGULAR_USER"] as const;
export type ChatRoleType = typeof roleType[number];

export const restrictionType = ["MUTED", "KICKED", "BANNED"] as const;
export type RestrictionType = typeof restrictionType[number];

export const durationUnit = ["MIN", "HOURS", "DAYS"] as const;
export type DurationUnitType = typeof durationUnit[number];

export const statusTypes = ["ONLINE", "OFFLINE", "PLAYING"] as const;
export type StatusType = typeof statusTypes[number];

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
