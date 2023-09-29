import { UserService } from 'src/user/user.service';
import { LibService } from './../lib/lib.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import { OTP } from './two-fa.types';
import { User } from '@prisma/client';

@Injectable()
export class TwoFaService {
  constructor(
    private readonly libService: LibService,
    private readonly userService: UserService,
  ) {}

  async generateOtp(id: string): Promise<OTP> {
    const user: User = await this.userService.findUserById(id);

    if (!user) throw new NotFoundException('User not found');

    if (!user) throw new UnauthorizedException('Activa 2fa first!');

    const otp_secret = this.libService.generateRandomSecretInBase32();

    const totp: OTPAuth.TOTP = this.generateNewTotpObject(otp_secret);

    const otp_auth_url = totp.toString();

    const otp: OTP = { otp_secret, otp_auth_url };
    console.log(otp_secret);

    await this.userService.updateUserByEmail(user.email, otp);

    return otp;
  }

  async validateOtp(id: string, token: string) {
    const user = await this.userService.findUserById(id);

    if (!user) throw new NotFoundException('User not found');

    const userTwoFa = await this.userService.findUserTwoFaById(id);

    if (!userTwoFa) throw new UnauthorizedException('Activa 2fa first!');

    if (userTwoFa.otp_secret === null)
      throw new BadRequestException('Missing secret');

    const totp: OTPAuth.TOTP = this.generateNewTotpObject(userTwoFa.otp_secret);

    const delta = totp.validate({ token });

    if (delta === null) throw new BadRequestException('Invalid token');

    await this.userService.updateUserById(id, {
      otp_validated: true,
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
