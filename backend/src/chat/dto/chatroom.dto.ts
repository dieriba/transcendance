import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ChatRoomDto {
  @IsString()
  @IsNotEmpty()
  chatroomName: string;

  @IsArray()
  users: string[];
}
