import { TwoFaService } from './two-fa.service';
import { Body, Controller, Post } from '@nestjs/common';
import { OTP } from './two-fa.types';
import { VerifyOtpDto } from './dto/verify-opt.dto';
import { GetUser } from 'src/common/custom-decorator/get-user';

@Controller('/auth/2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}
  @Post('generate')
  async generateOtp(@GetUser('id') id: string): Promise<OTP> {
    return await this.twoFaService.generateOtp(id);
  }

  @Post('validate-otp')
  async validateOtp(
    @GetUser('id') id: string,
    @Body() { token }: VerifyOtpDto,
  ) {
    return await this.twoFaService.validateOtp(id, token);
  }
}
