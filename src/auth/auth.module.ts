import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';
import { BcryptService } from 'src/bcrypt/bcrypt.service';

@Module({
  imports: [HttpModule, UserModule],
  providers: [AuthService, BcryptService],
  controllers: [AuthController],
})
export class AuthModule {}
