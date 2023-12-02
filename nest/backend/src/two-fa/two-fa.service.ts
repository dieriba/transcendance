import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { OTP } from './types/two-fa.types';
import { UserService } from 'src/user/user.service';
import { UserData, UserTwoFa } from 'src/common/types/user-info.type';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { authenticator } from 'otplib';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { VerifyOtpDto } from './dto/two-fa.dto';
import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import { Profile, STATUS } from '@prisma/client';
import { Tokens } from 'src/jwt-token/jwt.type';
import { Argon2Service } from 'src/argon2/argon2.service';

@Injectable()
export class TwoFaService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly argon2Service: Argon2Service,
  ) {}

  async generateOtp(userId: string): Promise<OTP> {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();

    const otpTempSecret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      otpTempSecret,
    );

    const otp: OTP = { otpTempSecret, otpAuthUrl };

    if (!user.twoFa) {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          twoFa: {
            create: { otpTempSecret },
          },
        },
      });
    } else {
      await this.prismaService.twoFa.update({
        where: { userId },
        data: { otpTempSecret },
      });
    }
    return otp;
  }

  async enableTwoFa(userId: string, token: string) {
    const user = await this.userService.findUserById(userId, UserTwoFa);

    if (!user) throw new UserNotFoundException();

    if (user.twoFa.otpTempSecret === null)
      throw new BadRequestException('Missing secret');

    const check = authenticator.check(token, user.twoFa.otpTempSecret);

    if (!check) throw new BadRequestException('Invalid token');

    await this.prismaService.twoFa.update({
      where: {
        userId,
      },
      data: {
        otpEnabled: true,
        otpSecret: user.twoFa.otpTempSecret,
        otpTempSecret: null,
      },
    });
  }

  async validateOtp({ id, token }: VerifyOtpDto): Promise<
    {
      user: {
        id: string;
        nickname: string;
        twoFa: boolean;
        allowForeignToDm: boolean;
        profile: Partial<Profile>;
      };
    } & Tokens
  > {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      },
      select: {
        nickname: true,
        allowForeignToDm: true,
        profile: {
          select: {
            avatar: true,
            firstname: true,
            lastname: true,
          },
        },
        twoFa: true,
      },
    });

    if (!user) throw new UserNotFoundException();

    if (!user.twoFa.otpEnabled)
      throw new CustomException('Activa 2fa first!', HttpStatus.FORBIDDEN);

    if (user.twoFa.otpSecret === null)
      throw new CustomException('Missing secret', HttpStatus.BAD_REQUEST);

    const check = authenticator.check(token, user.twoFa.otpSecret);

    if (!check)
      throw new CustomException('Invalid token', HttpStatus.BAD_REQUEST);

    const { nickname, allowForeignToDm, profile } = user;

    const tokens = await this.jwtTokenService.getTokens(id);

    await this.userService.updateUserById(id, {
      status: STATUS.ONLINE,
      hashedRefreshToken: await this.argon2Service.hash(tokens.refresh_token),
    });

    return {
      user: { id, nickname, twoFa: true, profile, allowForeignToDm },
      ...tokens,
    };
  }

  async updateTwoFa(userId: string, token: string) {
    const user = await this.userService.findUserById(userId, UserTwoFa);

    if (!user) throw new UserNotFoundException();

    if (!user.twoFa.otpEnabled)
      throw new CustomException('Activa 2fa first!', HttpStatus.FORBIDDEN);

    if (user.twoFa.otpTempSecret === null)
      throw new BadRequestException('Missing secret');

    const check = authenticator.check(token, user.twoFa.otpTempSecret);

    if (!check) throw new BadRequestException('Invalid token');

    await this.prismaService.twoFa.update({
      where: {
        userId,
      },
      data: {
        otpSecret: user.twoFa.otpTempSecret,
        otpTempSecret: null,
      },
    });
  }

  async disableTwoFa(userId: string, token: string) {
    const user = await this.userService.findUserById(userId, UserTwoFa);

    if (!user) throw new UserNotFoundException();

    if (!user.twoFa.otpEnabled)
      throw new CustomException('2FA not enabled!', HttpStatus.FORBIDDEN);

    const check = authenticator.check(token, user.twoFa.otpSecret);

    if (!check) throw new BadRequestException('Invalid token');

    await this.prismaService.twoFa.update({
      where: {
        userId,
      },
      data: {
        otpEnabled: false,
        otpSecret: null,
      },
    });
  }
}
