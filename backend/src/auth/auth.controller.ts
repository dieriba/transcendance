import { JwtPayloadRefreshToken } from './../jwt-token/jwt.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetOAuthDto, LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { CheckEmailNicknameValidity } from './pipe/auth.pipe';
import { HashPassword } from './pipe/hash-password.pipe';
import { OAuthPipe } from './pipe/oauth.pipe';
import { LoginValidation } from './pipe/login-validation.pipe';
import { Tokens } from 'src/jwt-token/jwt.type';
import { PublicRoute } from 'src/common/custom-decorator/public.decorator';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { JwtRefreshTokenGuard } from 'src/common/guards/refrestJwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @PublicRoute()
  @Post('signup')
  async signup(
    @Body(CheckEmailNicknameValidity, HashPassword)
    registerUserDto: RegisterUserDto,
  ) {
    return await this.authService.signup(registerUserDto);
  }

  @PublicRoute()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(LoginValidation) loginUserDto: LoginUserDto,
  ): Promise<Tokens> {
    return await this.authService.login(loginUserDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged Out, succesfully')
  logout(@GetUser('sub') id: string) {
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
  async refresh(@GetUser() user: JwtPayloadRefreshToken): Promise<Tokens> {
    return await this.authService.refresh(user);
  }
}
