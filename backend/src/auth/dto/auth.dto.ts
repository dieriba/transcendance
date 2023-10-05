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

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  @Matches('^[a-zA-Z][a-zA-Z0-9_.]*$')
  readonly nickname: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @Match('password', { message: 'Password do not match' })
  readonly confirmPassword: string;
}

export class LoginUserDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsOptional()
  readonly id: string;

  @IsOptional()
  readonly nickname: string;
}

export class GetOAuthDto {
  readonly code: string;
}
