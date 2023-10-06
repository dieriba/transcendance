import { TwoFaService } from './two-fa.service';
import { Body, Controller, Post } from '@nestjs/common';
import { OTP } from './types/two-fa.types';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { VerifyOtpDto } from './dto/two-fa.dto';

@Controller('/auth/2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  /* @Put('/activate-two-fa')
  @ResponseMessage('2fa Enabled successfully !')
  async updateUser2fa(@GetUser('sub') id: string) {
    return await this.twoFaService.updateUser2Fa(id);
  } */

  @Post('generate')
  async generateOtp(@GetUser('userId') id: string): Promise<OTP> {
    return await this.twoFaService.generateOtp(id);
  }

  @Post('validate-otp')
  @ResponseMessage('Authenticated Successfully')
  async validateOtp(
    @GetUser('userId') id: string,
    @Body() { token }: VerifyOtpDto,
  ) {
    return await this.twoFaService.validateOtp(id, token);
  }
}
