export type ChatroomInfo = {
  id: boolean;
  chatRoomName: boolean;
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
  chatRoomName: true,
  password: false,
  type: true,
  createdAt: false,
  updatedAt: false,
  numberOfUser: false,
  invitedUser: true,
  users: true,
  messages: true,
  restrictedUsers: false,
};
