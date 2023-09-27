import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { CreatedUser } from 'src/user/user.types';
import { UserService } from 'src/user/user.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';

@Injectable()
export class CheckEmailValidity implements PipeTransform {
  constructor(private userService: UserService) {}
  async transform(user: CreatedUser, metadata: ArgumentMetadata) {
    const { email, nickName } = user;

    if (metadata.type === 'body') {
      console.log(email);

      if (await this.userService.findUserByEmail(email))
        throw new BadRequestException(`Email ${email} is already taken`);

      if (await this.userService.findUserByNickName(nickName))
        throw new BadRequestException(`Nickname ${nickName} is already taken`);

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

@Injectable()
export class HashPassword implements PipeTransform {
  constructor(private bcryptService: BcryptService) {}
  async transform(user: CreatedUser, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      try {
        user.password = await this.bcryptService.hash(user.password);

        return user;
      } catch (error) {
        throw new InternalServerErrorException();
      }
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
    /*if (
        metadata.type === 'query' ||
        metadata.type === 'param' ||
        metadata.type === 'custom' ||
        value === undefined ||
        value == ''
      )
      throw new BadRequestException('Data should only be passed through body'); */

    return value;
  }
}
