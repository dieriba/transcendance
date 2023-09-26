import { log } from 'console';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class AuthPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    log(metadata);
    return value;
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
