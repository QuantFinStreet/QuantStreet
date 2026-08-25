import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env.js';
import type { ModelRoute } from './modelRouter.js';

// Distinguishes "we're not configured" (503 — an ops problem) from
// "the provider rejected/failed the call" (502 — a runtime problem) so
// the route handler can map each to the right status without inspecting
// provider-specific error shapes.
export class ProviderConfigError extends Error {}
export class ProviderCallError extends Error {
  override readonly cause: unknown;
  constructor(message: string, cause: unknown) {
    super(message);
    this.cause = cause;
  }
}

// A slow/hanging model (observed in testing — some Gemini models take 50s+
// or never resolve) shouldn't leave the client's request open indefinitely.
const PROVIDER_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${PROVIDER_TIMEOUT_MS}ms`));
    }, PROVIDER_TIMEOUT_MS);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!env.openaiApiKey) {
    throw new ProviderConfigError('OPENAI_API_KEY is not configured on the server.');
  }
  openaiClient ??= new OpenAI({ apiKey: env.openaiApiKey });
  return openaiClient;
}

let geminiClient: GoogleGenerativeAI | null = null;
function getGeminiClient(): GoogleGenerativeAI {
  if (!env.geminiApiKey) {
    throw new ProviderConfigError('GEMINI_API_KEY is not configured on the server.');
  }
  geminiClient ??= new GoogleGenerativeAI(env.geminiApiKey);
  return geminiClient;
}

async function callOpenAI(model: string, prompt: string): Promise<string> {
  const client = getOpenAIClient();
  try {
    const completion = await withTimeout(
      client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 300,
      }),
      'OpenAI request'
    );
    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('Empty response from OpenAI');
    return text.trim();
  } catch (err) {
    // Never forward the raw provider error (may include request echoes) —
    // wrap it and let the caller decide what the client is told.
    throw new ProviderCallError('OpenAI request failed.', err);
  }
}

async function callGemini(model: string, prompt: string): Promise<string> {
  const client = getGeminiClient();
  try {
    const genModel = client.getGenerativeModel({ model });
    const result = await withTimeout(genModel.generateContent(prompt), 'Gemini request');
    const text = result.response.text();
    if (!text) throw new Error('Empty response from Gemini');
    return text.trim();
  } catch (err) {
    throw new ProviderCallError('Gemini request failed.', err);
  }
}

export async function callProvider(route: ModelRoute, prompt: string): Promise<string> {
  return route.provider === 'openai' ? callOpenAI(route.model, prompt) : callGemini(route.model, prompt);
}
