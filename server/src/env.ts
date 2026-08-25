import 'dotenv/config';

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function optionalOrUndefined(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

// Comma-separated list, e.g. "http://localhost:5173,https://app.finpilot.com".
// Keeps localhost working in dev while letting a single deployed client
// origin (or a short list of them) be added for production.
function parseOrigins(name: string, fallback: string): string[] {
  const raw = optional(name, fallback);
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export const env = {
  port: Number(optional('PORT', '4000')),
  nodeEnv: optional('NODE_ENV', 'development'),
  allowedOrigins: parseOrigins('CLIENT_ORIGIN', 'http://localhost:5173,http://localhost:5174'),

  openaiApiKey: optionalOrUndefined('OPENAI_API_KEY'),
  geminiApiKey: optionalOrUndefined('GEMINI_API_KEY'),

  chatRateLimitPerMinute: Number(optional('CHAT_RATE_LIMIT_PER_MINUTE', '20')),
};
