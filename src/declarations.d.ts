declare module "*.png" {
  const value: string;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_INCIDENTS_API_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_SEARCH_USERS_PATH: string;
  readonly VITE_SEARCH_LOCATIONS_PATH: string;
  readonly VITE_INCIDENTS_ENDPOINT: string;
  readonly VITE_AFFECTED_USERS_ENDPOINT: string;
  readonly VITE_DEFAULT_LIMIT: string;
  readonly VITE_DEFAULT_OFFSET: string;
  readonly VITE_CACHE_TTL: string;
  readonly VITE_AFFECTED_USERS_CACHE_TTL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}