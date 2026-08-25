import 'dotenv/config';

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  port: Number(optional('PORT', '4000')),
  nodeEnv: optional('NODE_ENV', 'development'),
  clientOrigin: optional('CLIENT_ORIGIN', 'http://localhost:5173'),
};
