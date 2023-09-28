import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreatedUser } from 'src/user/user.types';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CheckEmailNicknameValidity implements PipeTransform {
  constructor(private userService: UserService) {}
  async transform(user: CreatedUser, metadata: ArgumentMetadata) {
    const { email, nickname } = user;

    if (metadata.type === 'body') {
      if (await this.userService.findUserByEmail(email))
        throw new BadRequestException(`Email ${email} is already taken`);

      if (await this.userService.findUserByNickName(nickname))
        throw new BadRequestException(`Nickname ${nickname} is already taken`);

      const endEmail = email.endsWith('42.fr');

      if (endEmail)
        throw new BadRequestException(
          'Email with 42.fr at the end are reserverd for login via 42 API!',
        );

      return user;
    }

    throw new BadRequestException(
      "Data must be only passed through the request's body",
    );
  }
}
