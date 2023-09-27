import { RegisterUserDto } from './dto/registerUser.dto';
import { GetOAuthDto } from './dto/getOAuth.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HttpStatusCode } from 'axios';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/loginUser.dto';
import { ApiUser } from 'src/user/user.types';
import * as randomstring from 'randomstring';

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private userService: UserService,
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

  async login(loginUserDto: LoginUserDto): Promise<any> {}

  async oauth(getOAuthDto: GetOAuthDto) {
    try {
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

      const { access_token } = response.data;

      if (!access_token || access_token === undefined)
        throw new UnauthorizedException();

      const { data } = await this.httpService.axiosRef.get(
        process.env.API_URI,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      if (data === undefined || data === null) throw new NotFoundException();

      const user: ApiUser = {
        email: data.email,
        nickName: randomstring.generate({
          length: 16,
          charset: 'alphabetic',
        }),
        lastName: data.last_name,
        firstName: data.firs_tName,
        fullName: data.displayname,
      };

      const newUser = await this.userService.createOrReturn42User(user);

      console.log({ newUser });

      return {
        success: 'true',
        message: 'User API 42 created succesfully',
        newUser,
      };
    } catch (error) {
      if (error.response?.status == HttpStatusCode.Unauthorized)
        throw new UnauthorizedException();
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async refresh() {}
}
