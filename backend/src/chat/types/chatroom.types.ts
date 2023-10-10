export class Message {
  senderId: string;
  receiverId: string;
  content: string;
}

export type User = {
  nickname: string;
};

export class ChatRoomData {
  users: string[];

  nickname: string;

  chatroomId: string;

  userId: string;
}
