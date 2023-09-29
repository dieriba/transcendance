export type CreatedUser = {
  email: string;
  nickname: string;
  lastname?: string;
  fullname?: string;
  password?: string;
  profile_picture?: string;
};

export type ApiUser = {
  email: string;
  nickname: string;
  last_name?: string;
  first_name?: string;
  fullname?: string;
};
