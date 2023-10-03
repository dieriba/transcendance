import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2Service {
  private readonly logger = new Logger(Argon2Service.name);
  async hash(hashString: string): Promise<string> {
    try {
      this.logger.log('Hashing user Password');
      const hash = await argon2.hash(hashString);
      return hash;
    } catch (error) {
      this.logger.log('Failled to hash user password, error: ', error);
      throw new InternalServerErrorException();
    }
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    try {
      this.logger.log('Comparing value to hash Value');
      const isMatch = await argon2.verify(value, hashedValue);
      return isMatch;
    } catch (error) {
      this.logger.log(
        'An error has occured while comparing value to hashValue: ',
        error,
      );
      throw new InternalServerErrorException();
    }
  }
}
