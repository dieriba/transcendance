import { OAuthPipe } from './auth.pipe';
import { Controller, Get, Post, Query } from '@nestjs/common';
import { GetOAuthDto } from './dto/getOAuth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup() {}

  @Post('login')
  async login() {}

  @Get('oauth_callback')
  async oauth(@Query('code', OAuthPipe) getOAuthDto: GetOAuthDto) {
    return await this.authService.oauth(getOAuthDto);
  }
}
