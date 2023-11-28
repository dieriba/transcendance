import { Module } from '@nestjs/common';
import { TwoFaService } from './two-fa.service';
import { TwoFaController } from './two-fa.controller';
import { UserModule } from 'src/user/user.module';
import { LibModule } from 'src/lib/lib.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtTokenModule } from 'src/jwt-token/jwtToken.module';

@Module({
  imports: [LibModule, UserModule, PrismaModule, JwtTokenModule],
  providers: [TwoFaService],
  controllers: [TwoFaController],
  exports: [TwoFaService],
})
export class TwoFaModule {}
