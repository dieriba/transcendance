import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from 'src/common/validation-decorator/match.decorator';
import { NotMatch } from 'src/common/validation-decorator/not-match.decorator';

export class ChangeUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @NotMatch('currentPassword', {
    message: 'New password must be different from the old one',
  })
  readonly password: string;

  @ApiProperty()
  @Match('password', { message: 'Password do not match' })
  readonly confirmPassword: string;
}
