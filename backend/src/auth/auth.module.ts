import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { BcryptModule } from 'src/bcrypt/bcrypt.module';
import { UserModule } from 'src/user/user.module';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';

@Module({
  imports: [HttpModule, BcryptModule, UserModule, JwtTokenModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
