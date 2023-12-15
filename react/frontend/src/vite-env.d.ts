/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_REACT_APP_API_URL: string;
  readonly VITE_WS_SERVER: string;
  readonly VITE_UPLOAD_PATH_URI: string;
  readonly OAUTH_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
