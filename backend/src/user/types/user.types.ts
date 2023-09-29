export type TwoFa = {
  otp_secret?: string;
  otp_auth_url?: string;

  otp_enabled?: boolean;
  otp_validated?: boolean;
};

export type Profile = {
  avatar?: string;
  first_name?: string;
  last_name?: string;
  fullname?: string;
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
  hashed_refresh_token?: string;
};
