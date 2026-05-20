export const environment = {
  production: false,
  apiUrl: (window as any)['env']?.API_URL + ':8080' || 'http://localhost'
};
