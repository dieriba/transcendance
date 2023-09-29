import { IsNotEmpty, IsString } from 'class-validator';

export class GenOtpDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;
}
