export const API_URL = (() => {
  const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  if (rawUrl.startsWith('http')) return rawUrl;
  // If it's just a slug (no dots), append .onrender.com
  if (!rawUrl.includes('.')) return `https://${rawUrl}.onrender.com`;
  return `https://${rawUrl}`;
})();
