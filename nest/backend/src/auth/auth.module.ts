import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { Argon2Module } from 'src/argon2/argon2.module';
import { UserModule } from 'src/user/user.module';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [HttpModule, Argon2Module, UserModule, JwtTokenModule, PrismaModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
