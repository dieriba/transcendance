import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BlockUserDto {
  @IsString()
  @IsNotEmpty()
  otherUserId: string;

  @IsOptional()
  userId: string;
}
