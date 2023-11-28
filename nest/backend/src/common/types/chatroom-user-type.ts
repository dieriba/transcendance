export type ChatroomUserInfo = {
  user: boolean;
  userId: boolean;
  chatroom: boolean;
  chatroomId: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  penFriend: boolean;
  privilege: boolean;
  restriction: boolean;
};

export const ChatroomUserBaseData: ChatroomUserInfo = {
  user: false,
  userId: false,
  chatroom: true,
  chatroomId: true,
  createdAt: false,
  updatedAt: false,
  penFriend: false,
  privilege: true,
  restriction: false,
};
