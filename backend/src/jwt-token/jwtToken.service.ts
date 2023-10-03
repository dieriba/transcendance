import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens } from './jwt.type';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async checkToken(token: string, secret: string): Promise<any> {
    return this.jwtService.verify(token, { secret });
  }

  async createToken(payload: JwtPayload, secret: string, expiresIn: string) {
    return await this.jwtService.signAsync(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });
  }

  async getTokens(
    sub: string,
    email: string,
    nickname: string,
  ): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub,
      email,
      nickname,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.createToken(
        jwtPayload,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXP,
      ),
      this.createToken(
        jwtPayload,
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXP,
      ),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
