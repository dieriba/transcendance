import { JwtTokenService } from 'src/jwt-token/jwtToken.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
