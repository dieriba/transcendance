import { IsString, MinLength } from 'class-validator';

export class UserInfoUpdateDto {
  @IsString()
  @MinLength(3)
  nickname: string;
}
