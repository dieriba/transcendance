import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Argon2Service } from 'src/argon2/argon2.service';
import { CreatedUser } from 'src/user/types/user.types';

@Injectable()
export class HashPassword implements PipeTransform {
  constructor(private argon2Service: Argon2Service) {}
  async transform(data: CreatedUser, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      data.password = await this.argon2Service.hash(data.password);

      return data;
    }

    throw new BadRequestException();
  }
}
