import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as base32Encode from 'hi-base32';

@Injectable()
export class LibService {
  /*Generate secret for opt*/
  generateRandomSecretInBase32(): string {
    const buffer = crypto.randomBytes(20);
    const truncatedBase32 = base32Encode
      .encode(buffer)
      .replace(/=/g, '')
      .substring(0, 24);

    return truncatedBase32;
  }

  checkIfString(data: any): boolean {
    return typeof data !== 'string' || data.length === 0;
  }
}
