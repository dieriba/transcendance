import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetOAuthDto, LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Tokens } from 'src/jwt-token/jwt.type';
import { CheckEmailNicknameValidity } from './pipe/auth.pipe';
import { HashPassword } from './pipe/hash-password.pipe';
import { OAuthPipe } from './pipe/oauth.pipe';
import { LoginValidation } from './pipe/login-validation.pipe';
import { PublicRoute } from 'src/common/custom-decorator/public.decorator';

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
  async login(
    @Body(LoginValidation) loginUserDto: LoginUserDto,
  ): Promise<Tokens> {
    return await this.authService.login(loginUserDto);
  }

  @PublicRoute()
  @Get('oauth_callback')
  async oauth(@Query('code', OAuthPipe) getOAuthDto: GetOAuthDto) {
    return await this.authService.oauth(getOAuthDto);
  }

  @Post('refresh')
  async refresh() {
    return await this.authService.refresh();
  }
}
