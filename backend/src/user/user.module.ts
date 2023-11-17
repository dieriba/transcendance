import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';
import { Argon2Module } from 'src/argon2/argon2.module';

@Module({
  imports: [JwtTokenModule, Argon2Module],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
