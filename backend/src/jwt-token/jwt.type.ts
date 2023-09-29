export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  id: string;
  email: string;
};
