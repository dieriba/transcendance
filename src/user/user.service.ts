import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiUser, CreatedUser } from './user.types';
import { User } from '@prisma/client';

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

  async updateUserByEmail(email: string, update) {
    return await this.prismaService.user.update({
      where: { email },
      data: { ...update },
    });
  }

  async updateUserById(id: string, update) {
    return await this.prismaService.user.update({
      where: { id },
      data: { ...update },
    });
  }

  async createOrReturn42User(user: ApiUser): Promise<User> {
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
