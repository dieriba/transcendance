import { Module } from '@nestjs/common';
import { JwtTokenService } from './jwtToken.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [JwtTokenService, JwtService],
  exports: [JwtTokenService],
})
export class JwtTokenModule {}
