import { GetOAuthDto, LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import {
  Body,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HttpStatusCode } from 'axios';
import * as randomstring from 'randomstring';
import { LoginValidation } from './pipe/login-validation.pipe';
import { Tokens } from 'src/jwt-token/jwt.type';
import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import { UserService } from 'src/user/user.service';
import { ApiUser } from 'src/user/user.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async signup(registerUserDto: RegisterUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...data } = registerUserDto;

    try {
      const newUser = await this.userService.createUser(data);

      console.log({ newUser });

      return { success: true, message: 'User created successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async login(
    @Body(LoginValidation) { id, email }: LoginUserDto,
  ): Promise<Tokens> {
    return await this.jwtTokenService.getTokens(id, email);
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
      last_name: data.last_name,
      first_name: data.first_Name,
      fullname: data.displayname,
    };

    try {
      const newUser = await this.userService.createOrReturn42User(user);
      console.log({ newUser });

      return await this.jwtTokenService.getTokens(newUser.id, newUser.email);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async refresh() {}
}
