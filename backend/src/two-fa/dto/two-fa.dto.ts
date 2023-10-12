import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
