export const environment = {
  production: false,
  apiUrl: (window as any)['env']?.API_URL || 'http://localhost:8081'
};
