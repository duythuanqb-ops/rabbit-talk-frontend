import development from './development';
import production from './production';

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const baseConfig = env === 'production' ? production : development;

const config = {
  nodeEnv: env,
  port: Number(process.env.PORT ?? baseConfig.port),
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? baseConfig.apiUrl,
} as const;

export default config;
export type FrontendConfig = typeof config;
