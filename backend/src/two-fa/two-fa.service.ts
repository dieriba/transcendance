import { LibService } from '../lib/lib.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import { OTP } from './types/two-fa.types';
import { UserService } from 'src/user/user.service';
import { UserData, UserTwoFa } from 'src/common/types/user-info.type';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';

@Injectable()
export class TwoFaService {
  constructor(
    private readonly libService: LibService,
    private readonly userService: UserService,
  ) {}

  async generateOtp(id: string): Promise<OTP> {
    const user = await this.userService.findUserById(id, UserData);

    if (!user) new UserNotFoundException();

    if (!user) throw new UnauthorizedException('Activa 2fa first!');

    const otpSecret = this.libService.generateRandomSecretInBase32();

    const totp: OTPAuth.TOTP = this.generateNewTotpObject(otpSecret);

    const otpAuthUrl = totp.toString();

    const otp: OTP = { otpSecret, otpAuthUrl };

    await this.userService.updateUser2fa(user.id, otp);

    return otp;
  }

  async validateOtp(id: string, token: string) {
    const user = await this.userService.findUserById(id, UserTwoFa);

    if (!user) throw new UserNotFoundException();

    if (!user.twoFa) throw new UnauthorizedException('Activa 2fa first!');

    if (user.twoFa.otpSecret === null)
      throw new BadRequestException('Missing secret');

    const totp: OTPAuth.TOTP = this.generateNewTotpObject(user.twoFa.otpSecret);

    const delta = totp.validate({ token });

    if (delta === null) throw new BadRequestException('Invalid token');

    await this.userService.updateUser2fa(id, {
      otpValidated: true,
    });
    return { otp_validated: true };
  }

  generateNewTotpObject(otp_secret: string): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: process.env.OTP_ISSUER,
      label: process.env.OTP_LABEL,
      algorithm: process.env.OTP_ALGORITHM,
      digits: parseInt(process.env.OTP_DIGITS),
      period: parseInt(process.env.OTP_PERIOD),
      secret: otp_secret,
    });
  }
}
