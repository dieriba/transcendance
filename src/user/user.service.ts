import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiUser, CreatedUser } from './user.types';
import { Tokens } from 'src/jwt-token/jwt.type';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: CreatedUser) {
    return await this.prismaService.user.create({ data: { ...user } });
  }

  async findUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({ where: { email } });
  }

  async findUserByNickName(nickName: string) {
    return await this.prismaService.user.findUnique({ where: { nickName } });
  }

  async findUserByEmailOrNickName(value: string, field: string) {
    if (field === 'email') return this.findUserByEmail(field);

    return this.findUserByNickName(field);
  }

  async createOrReturn42User(user: ApiUser) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });

    if (foundUser) return foundUser;

    const newUser = await this.prismaService.user.create({
      data: { ...user },
    });

    return newUser;
  }
}
