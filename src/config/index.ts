// config.ts - Centralized configuration using environment variables

export const config = {
  // API Base Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  incidentsApiUrl: import.meta.env.VITE_INCIDENTS_API_URL || '',
  apiKey: import.meta.env.VITE_API_KEY || '',
  
  // API Endpoints
  incidentsEndpoint: import.meta.env.VITE_INCIDENTS_ENDPOINT || '/incidents',
  affectedUsersEndpoint: import.meta.env.VITE_AFFECTED_USERS_ENDPOINT || '/incidents/{number}/affected-users',
  searchUsersPath: import.meta.env.VITE_SEARCH_USERS_PATH || '/search/users',
  searchLocationsPath: import.meta.env.VITE_SEARCH_LOCATIONS_PATH || '/search/locations',
  
  // Pagination
  defaultLimit: Number(import.meta.env.VITE_DEFAULT_LIMIT) || 20,
  defaultOffset: Number(import.meta.env.VITE_DEFAULT_OFFSET) || 0,
  
  // Cache Settings
  cacheTtl: Number(import.meta.env.VITE_CACHE_TTL) || 60_000, // 1 minute
  affectedUsersCacheTtl: Number(import.meta.env.VITE_AFFECTED_USERS_CACHE_TTL) || 300_000, // 5 minutes
  
  // Environment
  isDev: import.meta.env.DEV || false,
  isProd: import.meta.env.PROD || false,
} as const;

// Helper functions
export const buildUrl = (endpoint: string, params?: Record<string, string | number>) => {
  let url = config.apiBaseUrl.replace(/\/$/, '') + endpoint;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += '?' + searchParams.toString();
  }
  
  return url;
};

export const buildIncidentsUrl = () => {
  if (config.incidentsApiUrl) {
    return `${config.incidentsApiUrl}?limit=${config.defaultLimit}&offset=${config.defaultOffset}`;
  }
  return buildUrl(config.incidentsEndpoint, {
    limit: config.defaultLimit,
    offset: config.defaultOffset
  });
};

export const buildAffectedUsersUrl = (incidentNumber: string) => {
  const endpoint = config.affectedUsersEndpoint.replace('{number}', incidentNumber);
  return buildUrl(endpoint);
};

export default config;