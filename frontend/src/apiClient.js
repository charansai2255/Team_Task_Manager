import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

console.log('API client initialized:', {
  baseURL: apiBaseUrl,
  devMode: import.meta.env.DEV,
  prodMode: import.meta.env.PROD
});

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Request interceptor: log the full URL
api.interceptors.request.use(
  (config) => {
    // In production, baseURL might be relative (e.g. '/api'), which crashes the URL constructor.
    // We'll use a safer way to log.
    const fullUrl = config.baseURL ? `${config.baseURL.replace(/\/$/, '')}/${config.url?.replace(/^\//, '')}` : config.url;
    console.log('[API Request]', {
      method: config.method?.toUpperCase(),
      url: fullUrl
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: log the response
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      dataType: typeof response.data,
      dataLength: response.data?.length || Object.keys(response.data || {}).length,
      isHTML: typeof response.data === 'string' && response.data.includes('<!doctype')
    });
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      dataType: typeof error.response?.data,
      isHTML: typeof error.response?.data === 'string' && error.response?.data.includes('<!doctype')
    });
    return Promise.reject(error);
  }
);

export default api;