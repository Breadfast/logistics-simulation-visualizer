
// API Configuration
// Change this URL to point to your backend API
export const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
