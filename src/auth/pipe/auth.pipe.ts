import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreatedUser } from 'src/user/user.types';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EmailExists implements PipeTransform {
  constructor(private userService: UserService) {}
  async transform(user: CreatedUser, metadata: ArgumentMetadata) {
    const { email, nickName } = user;
    if (metadata.type === 'body') {
      if (await this.userService.findUserByEmail(email))
        throw new BadRequestException(`Email ${email} is already taken`);

      if (await this.userService.findUserByNickName(nickName))
        throw new BadRequestException(`Nickname ${nickName} is already taken`);

      return user;
    }
    throw new BadRequestException();
  }
}

@Injectable()
export class OAuthPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'body' ||
      metadata.type === 'param' ||
      metadata.type === 'custom' ||
      value === undefined ||
      value == ''
    )
      throw new BadRequestException();

    return value;
  }
}
