export const environment = {
  production: false,
  apiUrl: (window as any)['env']?.API_URL || 'http://192.168.15.227:8080'
};
