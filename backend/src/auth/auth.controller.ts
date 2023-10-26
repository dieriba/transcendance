import { JwtPayloadRefreshToken } from './../jwt-token/jwt.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GetOAuthDto, LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { CheckEmailNicknameValidity } from './pipe/auth.pipe';
import { HashPassword } from './pipe/hash-password.pipe';
import { OAuthPipe } from './pipe/oauth.pipe';
import { LoginValidation } from './pipe/login-validation.pipe';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { JwtRefreshTokenGuard } from 'src/common/guards/refrestJwt.guard';
import { PublicRoute } from 'src/common/custom-decorator/metadata.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @PublicRoute()
  @Post('signup')
  @ResponseMessage('Signed Up!')
  async signup(
    @Body(CheckEmailNicknameValidity, HashPassword)
    registerUserDto: RegisterUserDto,
  ) {
    return await this.authService.signup(registerUserDto);
  }

  @PublicRoute()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged In Succesfully')
  async login(
    @Body(LoginValidation) loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, ...data } =
      await this.authService.login(loginUserDto);
    res.cookie('refresh', refresh_token, {
      httpOnly: true,
      path: '/auth/refresh',
      domain: process.env.FRONTEND_DOMAIN,
      maxAge: 7 * 60 * 60 * 24,
    });
    return data;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged Out, succesfully')
  logout(@GetUser('userId') id: string) {
    return this.authService.logout(id);
  }

  @PublicRoute()
  @Get('oauth_callback')
  async oauth(@Query('code', OAuthPipe) getOAuthDto: GetOAuthDto) {
    return await this.authService.oauth(getOAuthDto);
  }

  @Get('try')
  @ResponseMessage('ok')
  async try() {}

  @Post('refresh')
  @PublicRoute()
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetUser() user: JwtPayloadRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, ...data } = await this.authService.refresh(user);
    res.cookie('refresh', refresh_token, {
      httpOnly: true,
      path: '/auth/refresh',
      domain: process.env.FRONTEND_DOMAIN,
      maxAge: 7 * 60 * 60 * 24,
    });
    return data;
  }
}
