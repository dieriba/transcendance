import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateUsername } from 'unique-username-generator';
import { HttpService } from '@nestjs/axios';
import { HttpStatusCode } from 'axios';
import { JwtPayload, Tokens } from 'src/jwt-token/jwt.type';
import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import { UserService } from 'src/user/user.service';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import { Argon2Service } from 'src/argon2/argon2.service';
import { ApiUser, Profile } from 'src/user/types/user.types';
import {
  FORBIDDEN,
  RESSOURCE_NOT_FOUND,
} from 'src/common/constant/http-error.constant';
import { UserData, UserRefreshToken } from 'src/common/types/user-info.type';
import { STATUS } from '@prisma/client';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';
import { ChangeUserPasswordDto } from 'src/user/dto/ChangeUserPassword.dto';
import { ResponseLoginType } from './type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly argon2Service: Argon2Service,
    private readonly prismaService: PrismaService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signup(registerUserDto: RegisterUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lastname, firstname, email, password, nickname } = registerUserDto;
    console.log({ registerUserDto });

    try {
      this.logger.log(
        `Attempting to create new user with email: ${email} and nickname: ${nickname}`,
      );

      await this.userService.createUser(
        { email, password, nickname },
        { lastname, firstname },
        UserData,
      );

      return { success: true, message: 'User created successfully' };
    } catch (error) {
      console.log({ error });

      this.logger.log(
        `Failled to create new user with email: ${email} and nickname: ${nickname}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async login({ id, email, nickname, twoFa }: LoginUserDto): Promise<
    {
      user: ResponseLoginType;
    } & Tokens
  > {
    this.logger.log(
      `Attempting to create new tokens for user identified by email: ${email}`,
    );

    const tokens = await this.jwtTokenService.getTokens(id);

    const { allowForeignToDm, profile } = await this.userService.updateUserById(
      id,
      {
        status: twoFa ? STATUS.OFFLINE : STATUS.ONLINE,
        hashedRefreshToken: await this.argon2Service.hash(tokens.refresh_token),
      },
    );

    return {
      user: { id, nickname, twoFa, allowForeignToDm, profile },
      ...tokens,
    };
  }

  async logout(id: string) {
    const user = await this.userService.findUserById(id, UserData);

    if (!user) throw new UserNotFoundException();

    try {
      await this.userService.updateUserById(id, {
        hashedRefreshToken: null,
        status: STATUS.OFFLINE,
      });
    } catch (error) {}
  }

  async changeUserPassword(
    userId: string,
    changeUserPasswordDto: ChangeUserPasswordDto,
  ) {
    const user = await this.userService.findUserById(userId, UserData);

    if (!user) throw new UserNotFoundException();

    const { password, currentPassword } = changeUserPasswordDto;

    const userPassword = user.password;

    if (!userPassword)
      throw new CustomException(
        'Only account created through the standard way can change their password',
        HttpStatus.BAD_REQUEST,
      );

    const hashedCurrentPassword = await this.argon2Service.compare(
      userPassword,
      currentPassword,
    );

    if (!hashedCurrentPassword)
      throw new CustomException(
        'Current password not valid',
        HttpStatus.BAD_REQUEST,
      );

    await this.userService.updateUserById(userId, { password });
  }

  async oauth(code: string): Promise<
    | ({
        user: ResponseLoginType;
      } & Tokens)
    | { id: string; twoFa: boolean }
  > {
    const formData = new FormData();

    formData.append('client_secret', process.env.CLIENT_SECRET);
    formData.append('client_id', process.env.CLIENT_ID);
    formData.append('grant_type', process.env.GRANT_TYPE);
    formData.append('redirect_uri', process.env.REDIRECT_URI);
    formData.append('code', process.env.code);

    const response = await this.httpService.axiosRef.post(
      process.env.TOKEN_URI,
      {
        client_secret: process.env.CLIENT_SECRET,
        client_id: process.env.CLIENT_ID,
        grant_type: process.env.GRANT_TYPE,
        redirect_uri: process.env.REDIRECT_URI,
        code: code,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      },
    );

    if (response?.status == HttpStatusCode.Unauthorized) {
      throw new UnauthorizedException(
        'Account do not have enough authorization',
      );
    }
    const { access_token } = response.data;

    const { data } = await this.httpService.axiosRef.get(process.env.API_URI, {
      headers: { Authorization: `Bearer ${access_token}` },
      validateStatus: () => true,
    });

    if (!data) throw new NotFoundException();

    const res = await this.prismaService.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          nickname: data.login,
        },
      });

      const user: ApiUser = {
        email: data.email,
        nickname: existingUser ? data.login : generateUsername('', 3, 16),
      };

      const profile: Profile = {
        firstname: data.first_name,
        lastname: data.last_name,
        avatar: undefined,
      };

      const {
        id,
        nickname,
        twoFa,
        profile: { avatar },
      } = await this.userService.createOrReturn42User(
        tx,
        user,
        profile,
        UserData,
      );

      if (twoFa?.otpEnabled) {
        return { id, twoFa: true };
      }

      profile.avatar = avatar;

      const tokens = await this.jwtTokenService.getTokens(id);

      const { allowForeignToDm } = await tx.user.update({
        where: {
          id,
        },
        data: {
          hashedRefreshToken: await this.argon2Service.hash(
            tokens.refresh_token,
          ),
          status: twoFa?.otpEnabled ? STATUS.OFFLINE : STATUS.ONLINE,
        },
      });

      return {
        user: {
          id,
          nickname,
          twoFa: twoFa?.otpEnabled ? true : false,
          allowForeignToDm,
          profile,
        },
        ...tokens,
      };
    });

    return res;
  }

  async refresh(payload: JwtPayload, refresh_token: string): Promise<Tokens> {
    const { userId } = payload;

    const user = await this.userService.findUserById(userId, UserRefreshToken);

    if (!user)
      throw new CustomException(RESSOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);

    const isMatch = await this.argon2Service.compare(
      user.hashedRefreshToken,
      refresh_token,
    );

    if (!isMatch) throw new CustomException(FORBIDDEN, HttpStatus.FORBIDDEN);

    const tokens = await this.jwtTokenService.getTokens(userId);

    const hashedRefreshToken = await this.argon2Service.hash(
      tokens.refresh_token,
    );
    await this.userService.updateUserById(userId, {
      hashedRefreshToken,
    });

    return tokens;
  }
}
