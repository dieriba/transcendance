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
  blockedBy: boolean;
  friends: boolean,
  friendRequestsReceived: boolean;
  friendRequestsSent: boolean;
  chatrooms: boolean;
  messages: boolean;
  restrictedGroups: boolean;
};

export const UserId: UserInfo = {
  id: true,
  nickname: false,
  email: false,
  password: false,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: false,
  twoFa: false,
  profile: false,
  blockedUsers: false,
  blockedBy: false,
  friends: false,
  friendRequestsReceived: false,
  friendRequestsSent: false,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserData: UserInfo = {
  id: true,
  nickname: true,
  email: true,
  password: true,
  createdAt: true,
  updatedAt: true,
  hashedRefreshToken: false,
  twoFa: true,
  profile: true,
  blockedUsers: false,
  blockedBy: false,
  friends: false,
  friendRequestsReceived: false,
  friendRequestsSent: false,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserFriendRequest: UserInfo = {
  id: true,
  nickname: true,
  email: false,
  password: false,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: false,
  twoFa: true,
  profile: false,
  blockedUsers: false,
  blockedBy: false,
  friends: true,
  friendRequestsReceived: true,
  friendRequestsSent: true,
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
  blockedBy: false,
  friends: false,
  friendRequestsReceived: false,
  friendRequestsSent: false,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserBlockList: UserInfo = {
  id: true,
  nickname: false,
  email: false,
  password: false,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: false,
  twoFa: false,
  profile: false,
  blockedUsers: true,
  blockedBy: true,
  friends: false,
  friendRequestsReceived: true,
  friendRequestsSent: true,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserChatRoom: UserInfo = {
  id: true,
  nickname: false,
  email: false,
  password: false,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: false,
  twoFa: false,
  profile: false,
  blockedUsers: true,
  blockedBy: true,
  friends: false,
  friendRequestsReceived: true,
  friendRequestsSent: true,
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
  blockedBy: false,
  friends: false,
  friendRequestsReceived: false,
  friendRequestsSent: false,
  chatrooms: true,
  messages: false,
  restrictedGroups: true,
};
