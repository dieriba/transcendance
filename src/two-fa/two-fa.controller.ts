import { TwoFaService } from './two-fa.service';
import { Body, Controller, Post } from '@nestjs/common';
import { GenOtpDto } from './dto/gen-otp.dto';
import { OTP } from './two-fa.types';
import { VerifyOtpDto } from './dto/verify-opt.dto';

@Controller('/auth/2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}
  @Post('generate')
  async generateOtp(@Body() genOtpDto: GenOtpDto): Promise<OTP> {
    return await this.twoFaService.generateOtp(genOtpDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() { id, token }: VerifyOtpDto) {
    return await this.twoFaService.verifyOtp(id, token);
  }
  @Post('verify-otp')
  async validateOtp(@Body() { id, token }: VerifyOtpDto) {
    return await this.twoFaService.verifyOtp(id, token);
  }
}
