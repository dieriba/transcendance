import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FriendsTypeDto {
  @IsOptional()
  userId: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  friendId: string;
}

export class FriendsTypeNicknameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
