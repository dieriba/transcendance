import { GetOAuthDto } from './dto/getOAuth.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HttpStatusCode } from 'axios';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private userService: UserService,
  ) {}
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
        throw new BadRequestException();

      const res = await this.httpService.axiosRef.get(process.env.API_URI, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (res.data === undefined || res.data === null)
        throw new NotFoundException();
    } catch (error) {
      if (error.response?.status == HttpStatusCode.Unauthorized)
        throw new UnauthorizedException();

      throw new InternalServerErrorException();
    }
  }
}
