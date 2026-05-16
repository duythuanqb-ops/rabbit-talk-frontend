const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
  nodeEnv: env,
  port: Number(process.env.PORT ?? 3004),
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID',
  },
} as const;

export default config;
export type FrontendConfig = typeof config;
