import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class UserInfoUpdateDto {
  @IsString()
  @MinLength(3)
  nickname: string;
}
