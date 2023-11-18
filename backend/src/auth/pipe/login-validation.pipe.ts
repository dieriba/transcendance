import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Argon2Service } from 'src/argon2/argon2.service';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from '../dto/auth.dto';
import { UserData } from 'src/common/types/user-info.type';

@Injectable()
export class LoginValidation implements PipeTransform {
  constructor(
    private readonly argon2Service: Argon2Service,
    private readonly userService: UserService,
  ) {}

  async transform(body: LoginUserDto, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'query' ||
      metadata.type === 'param' ||
      metadata.type === 'custom'
    )
      throw new BadRequestException();

    const user = await this.userService.findUserByEmail(body.email, UserData);

    if (!user) throw new BadRequestException('Wrong Credentials!');

    if (!(await this.argon2Service.compare(user.password, body.password)))
      throw new BadRequestException('Wrong Credentials');

    return {
      ...body,
      id: user.id,
      nickname: user.nickname,
      twoFa: user.twoFa?.otpEnabled ? true : false,
    };
  }
}
