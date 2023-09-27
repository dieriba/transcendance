import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { JwtTokenModule } from './jwt-token/jwtToken.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    BcryptModule,
    JwtTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
