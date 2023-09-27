export type CreatedUser = {
  email: string;
  nickName: string;
  lastName?: string;
  fullName?: string;
  password?: string;
  profilePicture?: string;
};

export type ApiUser = {
  email: string;
  nickName: string;
  lastName?: string;
  firstName?: string;
  fullName?: string;
};
