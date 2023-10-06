import { IsNotEmpty, IsString } from 'class-validator';

export class GenOtpDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
