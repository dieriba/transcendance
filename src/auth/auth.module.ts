import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, UserModule],
  providers: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
