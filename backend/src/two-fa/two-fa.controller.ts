import { TwoFaService } from './two-fa.service';
import { Body, Controller, Post } from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { VerifyOtpDto } from './dto/two-fa.dto';
import * as qrcode from 'qrcode';
@Controller('2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Post('generate')
  async generateOtp(@GetUser('userId') id: string) {
    const { otpAuthUrl, otpSecret } = await this.twoFaService.generateOtp(id);
    const qrCode = await qrcode.toDataURL(otpAuthUrl);
    return { qrCode, otpSecret };
  }

  @Post('enable')
  @ResponseMessage('2Fa Enabled Sucessfully')
  async enableTwoFa(
    @GetUser('userId') id: string,
    @Body() { token }: VerifyOtpDto,
  ) {
    return await this.twoFaService.enableTwoFa(id, token);
  }

  @Post('validate')
  async validateOtp(
    @GetUser('userId') id: string,
    @Body() { token }: VerifyOtpDto,
  ) {
    return await this.twoFaService.validateOtp(id, token);
  }
}
