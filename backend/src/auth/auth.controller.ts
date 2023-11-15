import { JwtPayload } from './../jwt-token/jwt.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { CheckEmailNicknameValidity } from './pipe/auth.pipe';
import { HashPassword } from './pipe/hash-password.pipe';
import { LoginValidation } from './pipe/login-validation.pipe';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { JwtRefreshTokenGuard } from 'src/common/guards/refrestJwt.guard';
import { PublicRoute } from 'src/common/custom-decorator/metadata.decorator';
import { Request, Response } from 'express';

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
      maxAge: 7 * 60 * 60 * 24,
      sameSite: 'strict',
    });
    return data;
  }

  @Patch('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged Out, succesfully')
  logout(
    @GetUser('userId') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('refresh', '', { sameSite: 'strict' });
    return this.authService.logout(id);
  }

  @PublicRoute()
  @Get('oauth_callback/:code')
  async oauth(
    @Param('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, ...data } = await this.authService.oauth(code);
    res.cookie('refresh', refresh_token, {
      httpOnly: true,
      path: '/auth/refresh',
      maxAge: 7 * 60 * 60 * 24,
      sameSite: 'strict',
    });
    return data;
  }

  @Get('refresh')
  @PublicRoute()
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const refresh = req.cookies['refresh'];
    const { refresh_token, ...data } = await this.authService.refresh(
      user,
      refresh,
    );
    res.cookie('refresh', refresh_token, {
      httpOnly: true,
      path: '/auth/refresh',
      maxAge: 7 * 60 * 60 * 24,
      sameSite: 'strict',
    });
    return data;
  }
}
