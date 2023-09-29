import { Injectable } from '@nestjs/common';
import { ApiUser, CreatedUser, Profile, TwoFa } from './types/user.types';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModel } from './types/user.types';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: CreatedUser) {
    return await this.prismaService.user.create({ data: { ...user } });
  }

  async findUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({ where: { email } });
  }

  async findUserByNickName(nickname: string) {
    return await this.prismaService.user.findUnique({ where: { nickname } });
  }

  async findUserById(id: string) {
    return await this.prismaService.user.findUnique({ where: { id } });
  }

  async findUserByEmailOrNickName(value: string, field: string) {
    if (field === 'email') return this.findUserByEmail(field);

    return this.findUserByNickName(field);
  }

  async findUserTwoFaById(id: string) {
    return this.prismaService.twoFa.findUnique({ where: { id } });
  }

  async updateUserByEmail(email: string, user: UserModel) {
    return await this.prismaService.user.update({
      where: { email },
      data: {
        email: user.email || undefined,
        nickname: user.nickname || undefined,
        hashed_refresh_token: user.hashed_refresh_token || undefined,
        password: user.password || undefined,
      },
    });
  }

  async updateUserById(id: string, update: UserModel) {
    return await this.prismaService.user.update({
      where: { id },
      data: {
        email: update.email || undefined,
        nickname: update.nickname || undefined,
        hashed_refresh_token: update.hashed_refresh_token || undefined,
        password: update.password || undefined,
      },
    });
  }

  async updateUser2fa(id: string, twofa: TwoFa) {
    return await this.prismaService.twoFa.update({
      where: { userId: id },
      data: { ...twofa },
    });
  }

  async createOrReturn42User(user: ApiUser, profile: Profile): Promise<User> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });

    if (foundUser) return foundUser;

    const newUser = await this.prismaService.user.create({
      data: { ...user, profile: { create: profile } },
    });

    return newUser;
  }
}
