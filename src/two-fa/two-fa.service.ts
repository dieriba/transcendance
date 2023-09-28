import { UserService } from 'src/user/user.service';
import { GenOtpDto } from './dto/gen-otp.dto';
import { LibService } from './../lib/lib.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import { OTP } from './two-fa.types';

@Injectable()
export class TwoFaService {
  constructor(
    private readonly libService: LibService,
    private readonly userService: UserService,
  ) {}

  async generateOtp({ id }: GenOtpDto): Promise<OTP> {
    const user = await this.userService.findUserById(id);

    if (!user) throw new NotFoundException('User not found');

    const otp_secret = this.libService.generateRandomSecretInBase32();

    const totp: OTPAuth.TOTP = this.generateNewTotpObject(otp_secret);

    // Create a new TOTP object.

    // Convert to Google Authenticator key URI:
    // otpauth://totp/ACME:AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30
    const otp_auth_url = totp.toString(); // or 'OTPAuth.URI.stringify(totp)'

    //update user opt_secret

    const otp: OTP = { otp_secret, otp_auth_url };
    console.log(otp_secret);

    await this.userService.updateUserByEmail(user.email, otp);

    return otp;
  }

  async verifyOtp(id: string, token: string) {
    const user = await this.userService.findUserById(id);

    if (!user) throw new NotFoundException('User not found');

    const totp: OTPAuth.TOTP = this.generateNewTotpObject(user.otp_secret);

    console.log(user.otp_secret);

    console.log(token);

    const delta = totp.validate({ token });

    if (delta === null) throw new BadRequestException('Invalid token');

    try {
      const user = await this.userService.updateUserById(id, {
        otp_enabled: true,
      });

      return { otp_enabled: user.otp_enabled };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validateOtp(id: string, token: string) {
    const user = await this.userService.findUserById(id);

    if (!user) throw new NotFoundException('User not found');

    const totp: OTPAuth.TOTP = this.generateNewTotpObject(user.otp_secret);

    console.log(user.otp_secret);

    console.log(token);

    const delta = totp.validate({ token });

    if (delta === null) throw new BadRequestException('Invalid token');

    try {
      const user = await this.userService.updateUserById(id, {
        otp_enabled: true,
      });

      return { otp_validated: user.otp_validated };
    } catch (error) {
      throw new InternalServerErrorException();
    }
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
