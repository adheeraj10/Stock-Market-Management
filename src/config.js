const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
export const API_URL = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;
