import { GetOAuthDto, LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
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
import {
  INTERNAL_SERVER_ERROR,
  RESSOURCE_NOT_FOUND,
  FORBIDDEN,
} from 'src/common/constant/constant';
import { Argon2Service } from 'src/argon2/argon2.service';
import { ApiUser, Profile } from 'src/user/types/user.types';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly argon2: Argon2Service,
    private readonly prismaService: PrismaService,
  ) {}

  async signup(registerUserDto: RegisterUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...data } = registerUserDto;

    try {
      const newUser = await this.userService.createUser(data);

      return { success: true, message: 'User created successfully', newUser };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async login({ id, email }: LoginUserDto): Promise<Tokens> {
    try {
      const tokens = await this.jwtTokenService.getTokens(id, email);

      await this.userService.updateUserById(id, {
        hashed_refresh_token: await this.argon2.hash(tokens.refresh_token),
      });

      return tokens;
    } catch (error) {
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(id: string) {
    const user = await this.userService.findUserById(id);

    if (!user)
      throw new CustomException(RESSOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);

    try {
      await this.userService.clearHashedToken(id);
    } catch (error) {
      throw new CustomException(
        INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      first_name: data.first_name,
      last_name: data.last_name,
      fullname: data.fullname,
    };

    try {
      const newUser = await this.userService.createOrReturn42User(
        user,
        profile,
      );

      return await this.jwtTokenService.getTokens(newUser.id, newUser.email);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async refresh(payload: JwtPayloadRefreshToken): Promise<Tokens> {
    const { sub, email, refresh_token } = payload;

    const user = await this.userService.findUserById(sub);

    if (!user)
      throw new CustomException(RESSOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);

    const isMatch = await this.argon2.compare(
      user.hashed_refresh_token,
      refresh_token,
    );

    if (!isMatch) throw new CustomException(FORBIDDEN, HttpStatus.FORBIDDEN);

    const tokens = await this.jwtTokenService.getTokens(sub, email);

    const hashed_refresh_token = await this.argon2.hash(tokens.refresh_token);
    await this.userService.updateUserById(sub, {
      hashed_refresh_token,
    });

    return tokens;
  }
}
