export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  nickname: string;
};

export type RefreshToken = {
  refresh_token: string;
};

export type JwtPayloadRefreshToken = JwtPayload & RefreshToken;
