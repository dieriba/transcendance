declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    BACKEND_PORT: string;
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
  }
}
