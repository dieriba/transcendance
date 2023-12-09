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
