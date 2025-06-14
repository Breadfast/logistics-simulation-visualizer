
// API Configuration
// Change this URL to point to your backend API
export const API_BASE_URL = 'http://localhost:3000/';

// Mapbox Configuration
// Add your Mapbox public token here
export const MAPBOX_TOKEN = 'pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGVhc2QzZnMxMDBkM29wZ21xYXFpaXI3In0.example-token-replace-with-yours';

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
