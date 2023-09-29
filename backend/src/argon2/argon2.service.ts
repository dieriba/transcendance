import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2Service {
  async hash(hashString: string): Promise<string> {
    return await argon2.hash(hashString);
  }

  async compare(password: string, hashPassword: string): Promise<boolean> {
    return await argon2.verify(password, hashPassword);
  }
}
