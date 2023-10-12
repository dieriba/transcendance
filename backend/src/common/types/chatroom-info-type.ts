export type ChatroomInfo = {
  id: boolean;
  chatroomName: boolean;
  password: boolean;
  type: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  numberOfUser: boolean;
  invitedUser: boolean;
  users: boolean;
  messages: boolean;
  restrictedUsers: boolean;
};

export const ChatroomBaseData: ChatroomInfo = {
  id: true,
  chatroomName: true,
  password: true,
  type: true,
  createdAt: true,
  updatedAt: false,
  numberOfUser: false,
  invitedUser: true,
  users: true,
  messages: true,
  restrictedUsers: false,
};

export const ChatroomWithSpecificUser: ChatroomInfo = {
  id: true,
  chatroomName: true,
  password: false,
  type: true,
  createdAt: true,
  updatedAt: false,
  numberOfUser: false,
  invitedUser: true,
  users: true,
  messages: true,
  restrictedUsers: true,
};
