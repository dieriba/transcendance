import { GetOAuthDto, LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HttpStatusCode } from 'axios';
import * as randomstring from 'randomstring';
import { JwtPayloadRefreshToken, Tokens } from 'src/jwt-token/jwt.type';
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
@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly argon2: Argon2Service,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signup(registerUserDto: RegisterUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...data } = registerUserDto;
    try {
      this.logger.log(
        `Attempting to create new user with email: ${data.email} and nickname: ${data.nickname}`,
      );
      await this.userService.createUser(data, UserData);

      return { success: true, message: 'User created successfully' };
    } catch (error) {
      this.logger.log(
        `Failled to create new user with email: ${data.email} and nickname: ${data.nickname}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async login({
    id,
    email,
    nickname,
  }: LoginUserDto): Promise<
    { user: { id: string; nickname: string } } & Tokens
  > {
    try {
      this.logger.log(
        `Attempting to create new tokens for user identified by email: ${email}`,
      );
      const tokens = await this.jwtTokenService.getTokens(id, email);

      await this.userService.updateUserById(id, {
        hashedRefreshToken: await this.argon2.hash(tokens.refresh_token),
      });

      return { user: { id, nickname }, ...tokens };
    } catch (error) {
      this.logger.log(
        `Failled to create new tokens for user identified by email: ${email}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async logout(id: string) {
    const user = await this.userService.findUserById(id, UserData);

    if (!user)
      throw new CustomException(RESSOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);

    try {
      await this.userService.clearHashedToken(id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async oauth(getOAuthDto: GetOAuthDto) {
    const response = await this.httpService.axiosRef.post(
      process.env.TOKEN_URI,
      {
        client_secret: process.env.CLIENT_SECRET,
        client_id: process.env.CLIENT_ID,
        grant_type: process.env.GRANT_TYPE,
        redirect_uri: process.env.REDIRECT_URI,
        code: getOAuthDto,
      },
    );

    if (response?.status == HttpStatusCode.Unauthorized)
      throw new UnauthorizedException();

    const { access_token } = response.data;

    const { data } = await this.httpService.axiosRef.get(process.env.API_URI, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (data === undefined || data === null) throw new NotFoundException();

    const user: ApiUser = {
      email: data.email,
      nickname: randomstring.generate({
        length: parseInt(process.env.RANDOMSTRING_LENGTH),
        charset: process.env.RANDOMSTRING_CHARSET,
      }),
    };
    const profile: Profile = {
      firstName: data.first_name,
      lastName: data.last_name,
      fullname: data.fullname,
    };

    try {
      const { id, email } = await this.userService.createOrReturn42User(
        user,
        profile,
        UserData,
      );

      return await this.jwtTokenService.getTokens(id, email);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async refresh(payload: JwtPayloadRefreshToken): Promise<Tokens> {
    const { sub, email, refresh_token } = payload;

    const user = await this.userService.findUserById(sub, UserRefreshToken);

    if (!user)
      throw new CustomException(RESSOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);

    const isMatch = await this.argon2.compare(
      user.hashedRefreshToken,
      refresh_token,
    );

    if (!isMatch) throw new CustomException(FORBIDDEN, HttpStatus.FORBIDDEN);

    const tokens = await this.jwtTokenService.getTokens(sub, email);

    const hashedRefreshToken = await this.argon2.hash(tokens.refresh_token);
    await this.userService.updateUserById(sub, {
      hashedRefreshToken,
    });

    return tokens;
  }
}
