import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Argon2Service } from 'src/argon2/argon2.service';
import { CreatedUser } from 'src/user/types/user.types';

@Injectable()
export class HashPassword implements PipeTransform {
  constructor(private argon2Service: Argon2Service) {}
  async transform(user: CreatedUser, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      try {
        user.password = await this.argon2Service.hash(user.password);

        return user;
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }

    throw new BadRequestException();
  }
}
