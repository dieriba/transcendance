import { OAuthPipe } from './auth.pipe';
import { Controller, Get, Query } from '@nestjs/common';
import { GetOAuthDto } from './dto/getOAuth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('oauth_callback')
  async oauth(@Query('code', OAuthPipe) getOAuthDto: GetOAuthDto) {
    return await this.authService.oauth(getOAuthDto);
  }
}
