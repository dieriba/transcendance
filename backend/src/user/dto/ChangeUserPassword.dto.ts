import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from 'src/common/validation-decorator/match.decorator';

export class ChangeUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;
  @ApiProperty()
  @IsString()
  @MinLength(8)
  readonly password: string;

  @ApiProperty()
  @Match('password', { message: 'Password do not match' })
  readonly confirmPassword: string;
}
