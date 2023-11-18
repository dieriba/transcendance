import { TwoFaService } from './two-fa.service';
import { Body, Controller, Patch, Post, Res } from '@nestjs/common';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { TokenDto, VerifyOtpDto } from './dto/two-fa.dto';
import * as qrcode from 'qrcode';
import { PublicRoute } from 'src/common/custom-decorator/metadata.decorator';
import { Response } from 'express';
@Controller('2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Post('generate')
  async generateOtp(@GetUser('userId') id: string) {
    const { otpAuthUrl, otpTempSecret } =
      await this.twoFaService.generateOtp(id);
    const qrCode = await qrcode.toDataURL(otpAuthUrl);
    return { qrCode, otpTempSecret };
  }

  @Patch('enable')
  @ResponseMessage('2Fa Enabled Sucessfully')
  async enableTwoFa(
    @GetUser('userId') id: string,
    @Body() { token }: TokenDto,
  ) {
    return await this.twoFaService.enableTwoFa(id, token);
  }

  @Post('validate')
  @PublicRoute()
  async validateOtp(
    @Body() verifyOtpDtop: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, ...data } =
      await this.twoFaService.validateOtp(verifyOtpDtop);
    res.cookie('refresh', refresh_token, {
      httpOnly: true,
      path: '/auth/refresh',
      maxAge: 7 * 60 * 60 * 24,
      sameSite: 'strict',
    });
    return data;
  }

  @Patch('update')
  @ResponseMessage('2Fa Updated Sucessfully')
  async updateTwoFa(
    @GetUser('userId') id: string,
    @Body() { token }: VerifyOtpDto,
  ) {
    return await this.twoFaService.updateTwoFa(id, token);
  }

  @Patch('disable')
  @ResponseMessage('2Fa Disabled Sucessfully')
  async disableTwoFa(
    @GetUser('userId') id: string,
    @Body() { token }: TokenDto,
  ) {
    return await this.twoFaService.disableTwoFa(id, token);
  }
}
