declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    BACKEND_PORT: number;
    WS_PORT: string;
    API_URI: string;
    TOKEN_URI: string;
    CLIENT_SECRET: string;
    CLIENT_ID: string;
    REDIRECT_URI: string;
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXP: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXP: string;
    BCRYPT_SALT: string;
    OTP_ISSUER: string;
    OTP_LABEL: stringn;
    OTP_ALGORITHM: string;
    OTP_DIGITS: string;
    OTP_PERIOD: string;
    RANDOMSTRING_LENGTH: string;
    RANDOMSTRING_CHARSET: string;
    FRONTEND_DOMAIN: string;
  }
}
