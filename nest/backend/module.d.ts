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
    RANDOMSTRING_LENGTH: string;
    RANDOMSTRING_CHARSET: string;
    FRONTEND_DOMAIN: string;
    FRONTEND_PORT: string;
    UPLOAD_DIR: string;
    AVATAR_UPLOAD_PATH: string;
    BACKEND_DOMAIN_AVATAR: string;
    TWO_FACTOR_AUTHENTICATION_APP_NAME: string;
    REACT_DOCKER_ADRESS: string;
    REQUEST_LIMIT: string;
    REQUEST_NUMBER: string;
  }
}
