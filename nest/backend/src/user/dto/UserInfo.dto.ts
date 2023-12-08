import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class UserIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class UserInfoUpdateDto {
  @IsString()
  @MinLength(3)
  @Matches('^[a-zA-Z][a-zA-Z0-9_.]*$')
  nickname: string;
}
