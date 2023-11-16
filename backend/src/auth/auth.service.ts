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
import { LibService } from 'src/lib/lib.service';
import { STATUS } from '@prisma/client';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly argon2: Argon2Service,
    private readonly libService: LibService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signup(registerUserDto: RegisterUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lastname, firstname, email, password, nickname } = registerUserDto;
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
      this.logger.log(
        `Failled to create new user with email: ${email} and nickname: ${nickname}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async login({ id, email, nickname, isTwoFaEnabled }: LoginUserDto): Promise<
    {
      user: {
        id: string;
        nickname: string;
        isTwoFaEnabled: boolean;
        allowForeignToDm: boolean;
        profile: Partial<Profile>;
      };
    } & Tokens
  > {
    try {
      this.logger.log(
        `Attempting to create new tokens for user identified by email: ${email}`,
      );
      const tokens = await this.jwtTokenService.getTokens(id, email, nickname);

      const { allowForeignToDm, profile } =
        await this.userService.updateUserById(id, {
          status: STATUS.ONLINE,
          hashedRefreshToken: await this.argon2.hash(tokens.refresh_token),
        });

      return {
        user: { id, nickname, isTwoFaEnabled, allowForeignToDm, profile },
        ...tokens,
      };
    } catch (error) {
      this.logger.log(
        `Failled to create new tokens for user identified by email: ${email}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async logout(id: string) {
    const user = await this.userService.findUserById(id, UserData);

    if (!user) throw new UserNotFoundException();

    try {
      await this.userService.clearHashedToken(id, {
        status: STATUS.OFFLINE,
        hashedRefreshToken: null,
      });
    } catch (error) {}
  }

  async oauth(code: string): Promise<
    {
      user: {
        id: string;
        nickname: string;
        isTwoFaEnabled: boolean;
        allowForeignToDm: boolean;
        profile: Partial<Profile>;
      };
    } & Tokens
  > {
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

    const existingUser = await this.userService.findUserByNickName(
      data.login,
      UserData,
    );

    const user: ApiUser = {
      email: data.email,
      nickname: existingUser ? data.login : generateUsername('', 3, 16),
    };
    const profile: Profile = {
      firstname: data.first_name,
      lastname: data.last_name,
      avatar: undefined,
    };

    try {
      const { id, email, nickname, twoFa } =
        await this.userService.createOrReturn42User(user, profile, UserData);

      const tokens = await this.jwtTokenService.getTokens(id, email, nickname);

      const { allowForeignToDm } = await this.userService.updateUserById(id, {
        hashedRefreshToken: await this.argon2.hash(tokens.refresh_token),
      });

      return {
        user: {
          id,
          nickname,
          isTwoFaEnabled: twoFa?.otpEnabled ? twoFa.otpEnabled : false,
          allowForeignToDm,
          profile,
        },
        ...tokens,
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }

  async refresh(payload: JwtPayload, refresh_token: string): Promise<Tokens> {
    const { sub, email, nickname } = payload;

    const user = await this.userService.findUserById(sub, UserRefreshToken);

    if (!user)
      throw new CustomException(RESSOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);

    const isMatch = await this.argon2.compare(
      user.hashedRefreshToken,
      refresh_token,
    );

    if (!isMatch) throw new CustomException(FORBIDDEN, HttpStatus.FORBIDDEN);

    const tokens = await this.jwtTokenService.getTokens(sub, email, nickname);

    const hashedRefreshToken = await this.argon2.hash(tokens.refresh_token);
    await this.userService.updateUserById(sub, {
      hashedRefreshToken,
    });

    return tokens;
  }
}
