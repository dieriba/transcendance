import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UserData } from 'src/common/types/user-info.type';
import { UserService } from 'src/user/user.service';
import { GetOAuthDto } from '../dto/auth.dto';

@Injectable()
export class nicknameExistInDB implements PipeTransform {
  constructor(private userService: UserService) {}
  async transform(data: GetOAuthDto, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      const { nickname } = data;
      if (await this.userService.findUserByNickName(nickname, UserData))
        throw new BadRequestException(`Nickname ${nickname} is already taken`);

      return data;
    }

    throw new BadRequestException(
      "Data must be only passed through the request's body",
    );
  }
}
