import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Match } from '../../common/validation-decorator/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  @Matches('^[a-zA-Z][a-zA-Z0-9_.]*$')
  readonly nickname: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  readonly password: string;

  @ApiProperty()
  @Match('password', { message: 'Password do not match' })
  readonly confirmPassword: string;
}

export class LoginUserDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsOptional()
  readonly id: string;

  @IsOptional()
  readonly nickname: string;
}

export class GetOAuthDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly nickname: string;
}
