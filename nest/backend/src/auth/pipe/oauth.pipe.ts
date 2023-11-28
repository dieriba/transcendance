import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

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
