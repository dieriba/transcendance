import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { CreatedUser } from 'src/user/user.types';

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
