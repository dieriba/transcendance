export class Message {
  sender: string;
  receiver: string;
  content: string;
}

export type User = {
  nickname: string;
};

export type ChatRoomData = {
  chatroomName: string;

  users: string[];

  nickname: string;

  chatroom_id: string;
};
