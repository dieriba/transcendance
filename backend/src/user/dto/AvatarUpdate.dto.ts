import { IsNotEmpty, IsString } from 'class-validator';

export class AvatarUpdateDto {
  @IsString()
  @IsNotEmpty()
  avatar: string;
}
