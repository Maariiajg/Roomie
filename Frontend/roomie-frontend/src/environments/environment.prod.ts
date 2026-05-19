export const environment = {
  production: true,
  apiUrl: (window as any)['env']?.API_URL || 'http://192.168.15.227:8080'
};
