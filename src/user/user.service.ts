import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatedUser } from './user.types';

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
}
