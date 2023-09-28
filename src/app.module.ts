import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { JwtTokenModule } from './jwt-token/jwtToken.module';
import { LibModule } from './lib/lib.module';
import { TwoFaModule } from './two-fa/two-fa.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    BcryptModule,
    JwtTokenModule,
    LibModule,
    TwoFaModule,
  ],
  providers: [],
})
export class AppModule {}
