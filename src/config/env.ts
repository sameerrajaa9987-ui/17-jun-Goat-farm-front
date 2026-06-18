const ENV = {
  development: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL_DEV || "http://localhost:5001/api/v1",
    socketUrl:
      process.env.EXPO_PUBLIC_SOCKET_URL_DEV || "http://localhost:5001",
  },
  production: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL || "https://api.goatfarm.app/api/v1",
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || "https://api.goatfarm.app",
  },
};

const getEnv = () => {
  if (__DEV__) return ENV.development;
  return ENV.production;
};

export const environment = getEnv();
