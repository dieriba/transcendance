export type UserInfo = {
  id: boolean;
  nickname: boolean;
  email: boolean;
  password: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  hashedRefreshToken: boolean;
  twoFa: boolean;
  profile: boolean;
  blockedUsers: boolean;
  blockingUsers: boolean;
  followedBy: boolean;
  following: boolean;
  chatrooms: boolean;
  messages: boolean;
  restrictedGroups: boolean;
};

export const UserData: UserInfo = {
  id: true,
  nickname: true,
  email: true,
  password: false,
  createdAt: true,
  updatedAt: true,
  hashedRefreshToken: false,
  twoFa: false,
  profile: false,
  blockedUsers: false,
  blockingUsers: false,
  followedBy: false,
  following: false,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserTwoFa: UserInfo = {
  id: true,
  nickname: true,
  email: true,
  password: false,
  createdAt: true,
  updatedAt: true,
  hashedRefreshToken: false,
  twoFa: true,
  profile: false,
  blockedUsers: false,
  blockingUsers: false,
  followedBy: false,
  following: false,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserBlockList: UserInfo = {
  id: false,
  nickname: false,
  email: false,
  password: false,
  createdAt: true,
  updatedAt: true,
  hashedRefreshToken: false,
  twoFa: false,
  profile: false,
  blockedUsers: true,
  blockingUsers: true,
  followedBy: true,
  following: true,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserChatRoom: UserInfo = {
  id: true,
  nickname: true,
  email: true,
  password: true,
  createdAt: true,
  updatedAt: true,
  hashedRefreshToken: true,
  twoFa: true,
  profile: true,
  blockedUsers: true,
  blockingUsers: true,
  followedBy: true,
  following: true,
  chatrooms: true,
  messages: true,
  restrictedGroups: true,
};

export const UserRefreshToken: UserInfo = {
  id: true,
  nickname: false,
  email: false,
  password: false,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: true,
  twoFa: false,
  profile: false,
  blockedUsers: false,
  blockingUsers: false,
  followedBy: false,
  following: false,
  chatrooms: true,
  messages: false,
  restrictedGroups: true,
};
