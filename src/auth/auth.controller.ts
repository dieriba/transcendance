import { RegisterUserDto } from './dto/registerUser.dto';
import { CheckEmailValidity, HashPassword, OAuthPipe } from './pipe/auth.pipe';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetOAuthDto } from './dto/getOAuth.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/loginUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body(CheckEmailValidity, HashPassword) registerUserDto: RegisterUserDto,
  ) {
    return await this.authService.signup(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return await this.authService.login(loginUserDto);
  }

  @Get('oauth_callback')
  async oauth(@Query('code', OAuthPipe) getOAuthDto: GetOAuthDto) {
    return await this.authService.oauth(getOAuthDto);
  }

  @Post('refresh')
  async refresh() {
    return await this.authService.refresh();
  }
}
