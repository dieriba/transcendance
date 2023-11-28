import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RecipientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class FriendsTypeDto {
  @IsOptional()
  userId: string;
  @IsString()
  @IsNotEmpty()
  friendId: string;
}

export class FriendsTypeNicknameDto {
  @IsOptional()
  userId: string;
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
