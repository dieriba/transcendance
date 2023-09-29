import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { LoginUserDto } from '../dto';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LoginValidation implements PipeTransform {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly userService: UserService,
  ) {}

  async transform(body: LoginUserDto, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'query' ||
      metadata.type === 'param' ||
      metadata.type === 'custom'
    )
      throw new BadRequestException();

    const user = await this.userService.findUserByEmail(body.email);

    if (!user) throw new BadRequestException('Wrong Credentials!');

    if (!(await this.bcryptService.compare(body.password, user.password)))
      throw new BadRequestException('Wrong Credentials');

    return { ...body, id: user.id };
  }
}
