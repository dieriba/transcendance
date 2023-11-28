import { STATUS } from '@prisma/client';

export type TwoFa = {
  otpSecret?: string;
  otpAuth_url?: string;

  otpEnabled?: boolean;
  otpValidated?: boolean;
};

export type Profile = {
  avatar?: string;
  firstname?: string;
  lastname?: string;
};

export type CreatedUser = {
  email: string;
  nickname: string;
  password: string;
};

export type ApiUser = {
  email: string;
  nickname: string;
};

export type UserModel = {
  nickname?: string;
  email?: string;
  password?: string;
  hashedRefreshToken?: string;
  status?: STATUS;
};
