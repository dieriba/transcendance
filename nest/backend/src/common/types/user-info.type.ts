export type UserInfo = {
  id: boolean;
  nickname: boolean;
  email: boolean;
  password: boolean;
  createdAt: boolean;
  status: boolean;
  updatedAt: boolean;
  firstConnection: boolean;
  hashedRefreshToken: boolean;
  twoFa: boolean;
  pong: boolean;
  profile: boolean;
  blockedUsers: boolean;
  blockedBy: boolean;
  friends: boolean;
  allowForeignToDm: boolean;
  friendRequestsReceived: boolean;
  friendRequestsSent: boolean;
  chatrooms: boolean;
  messages: boolean;
  restrictedGroups: boolean;
};

export const UserId: UserInfo = {
  id: true,
  nickname: false,
  firstConnection: true,
  email: false,
  status: true,
  password: false,
  allowForeignToDm: true,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: false,
  twoFa: false,
  pong: true,
  profile: false,
  blockedUsers: false,
  blockedBy: false,
  friends: true,
  friendRequestsReceived: false,
  friendRequestsSent: false,
  chatrooms: false,
  messages: false,
  restrictedGroups: false,
};

export const UserData: UserInfo = {
  id: true,
  nickname: true,
  firstConnection: true,
  email: true,
  password: true,
  createdAt: true,
  status: true,
  updatedAt: true,
  allowForeignToDm: true,
  hashedRefreshToken: false,
  twoFa: true,
  pong: true,
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
  firstConnection: true,
  email: false,
  password: false,
  createdAt: false,
  status: true,
  updatedAt: false,
  hashedRefreshToken: false,
  twoFa: true,
  allowForeignToDm: true,
  pong: true,
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
  firstConnection: true,
  email: true,
  password: false,
  status: true,
  createdAt: true,
  updatedAt: true,
  hashedRefreshToken: false,
  allowForeignToDm: true,
  twoFa: true,
  pong: true,
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
  firstConnection: true,
  email: false,
  status: true,
  password: false,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: false,
  allowForeignToDm: true,
  twoFa: false,
  pong: true,
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
  firstConnection: true,
  email: false,
  password: false,
  createdAt: false,
  updatedAt: false,
  status: true,
  allowForeignToDm: true,
  hashedRefreshToken: false,
  twoFa: false,
  pong: true,
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
  firstConnection: true,
  email: false,
  password: false,
  createdAt: false,
  updatedAt: false,
  hashedRefreshToken: true,
  status: true,
  allowForeignToDm: true,
  twoFa: false,
  pong: true,
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
