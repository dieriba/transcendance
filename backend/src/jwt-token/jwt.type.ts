export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};

export type JwtPayloadRefreshToken = {
  sub: string;
  email: string;
  refresh_token: string;
};
