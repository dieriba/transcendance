import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { OTP } from './types/two-fa.types';
import { UserService } from 'src/user/user.service';
import { UserData, UserTwoFa } from 'src/common/types/user-info.type';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { authenticator } from 'otplib';
import { CustomException } from 'src/common/custom-exception/custom-exception';

@Injectable()
export class TwoFaService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateOtp(userId: string): Promise<OTP> {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();

    const otpSecret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      otpSecret,
    );

    const otp: OTP = { otpSecret, otpAuthUrl };

    if (!user.twoFa) {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          twoFa: {
            create: { ...otp },
          },
        },
      });
    } else {
      await this.prismaService.twoFa.update({
        where: { userId },
        data: { ...otp },
      });
    }
    return otp;
  }

  async validateOtp(userId: string, token: string) {
    const user = await this.userService.findUserById(userId, UserTwoFa);

    if (!user) throw new UserNotFoundException();

    if (!user.twoFa.otpEnabled)
      throw new CustomException('Activa 2fa first!', HttpStatus.FORBIDDEN);

    if (user.twoFa.otpSecret === null)
      throw new CustomException('Missing secret', HttpStatus.BAD_REQUEST);

    const check = authenticator.check(token, user.twoFa.otpSecret);

    if (!check)
      throw new CustomException('Invalid token', HttpStatus.BAD_REQUEST);

    await this.prismaService.twoFa.update({
      where: {
        userId,
      },
      data: {
        otpValidated: true,
      },
    });
    return { otp_validated: true };
  }

  async enableTwoFa(userId: string, token: string) {
    const user = await this.userService.findUserById(userId, UserTwoFa);

    if (!user) throw new UserNotFoundException();

    if (user.twoFa.otpSecret === null)
      throw new BadRequestException('Missing secret');

    const check = authenticator.check(token, user.twoFa.otpSecret);

    if (!check) throw new BadRequestException('Invalid token');

    await this.prismaService.twoFa.update({
      where: {
        userId,
      },
      data: {
        otpEnabled: true,
      },
    });
    return { twoFa: true };
  }
}
