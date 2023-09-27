import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtServicePayload } from './jwt.type';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async checkToken(token: string): Promise<any> {
    const decode = await this.jwtService.verifyAsync(token);
    return decode;
  }

  createToken(
    payload: IJwtServicePayload,
    secret: string,
    expiresIn: string,
  ): string {
    return this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });
  }
}
