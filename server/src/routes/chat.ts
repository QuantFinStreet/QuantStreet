import { Router, type Request } from 'express';
import type { ChatResponse } from '../types/index.js';
import type { FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { classifyQuery } from '../lib/queryClassifier.js';
import { routeForQuery } from '../lib/modelRouter.js';
import { buildPrompt } from '../lib/prompts.js';
import { callProvider, ProviderCallError, ProviderConfigError } from '../lib/providers.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import { ApiError } from '../middleware/errors.js';
import { chatRequestSchema, openAIChatRequestSchema, type ChatRequestInput, type OpenAIChatRequestInput } from '../schemas/chat.js';

// Provider failures are logged with full detail server-side (for
// debugging) but the client only ever gets a generic, typed message —
// raw SDK error bodies can carry request echoes or provider-internal
// detail we don't want to expose, and never carry the API key itself.
function toApiError(err: unknown): ApiError {
  if (err instanceof ProviderConfigError) {
    console.error('[chat] provider not configured:', err.message);
    return new ApiError(503, 'provider_not_configured', 'The AI assistant is not configured on the server right now.');
  }
  if (err instanceof ProviderCallError) {
    console.error('[chat] provider call failed:', err.cause);
    return new ApiError(502, 'provider_error', 'The AI provider could not complete this request. Please try again.');
  }
  console.error('[chat] unexpected error:', err);
  return new ApiError(500, 'internal_error', 'Something went wrong generating a response.');
}

export function chatRouter(repo: FinancialProfileRepository): Router {
  const router = Router();

  router.post(
    '/',
    validateBody(chatRequestSchema),
    asyncHandler(async (req: Request<unknown, ChatResponse, ChatRequestInput>, res) => {
      const { message } = req.body;
      const queryType = classifyQuery(message);
      const route = routeForQuery(queryType);

      let text: string;
      try {
        const profile = await repo.getProfile();
        const prompt = buildPrompt(queryType, message, profile);
        text = await callProvider(route, prompt);
      } catch (err) {
        throw toApiError(err);
      }

      const body: ChatResponse = {
        message: text,
        queryType,
        confidence: 0.85,
        relatedData: { provider: route.provider, model: route.model },
      };
      res.json(body);
    })
  );

  return router;
}

// Legacy direct passthrough — no classification, no profile injection,
// just a raw OpenAI completion. Mounted separately at /api/openai-chat.
export function openAIChatRouter(): Router {
  const router = Router();

  router.post(
    '/',
    validateBody(openAIChatRequestSchema),
    asyncHandler(async (req: Request<unknown, unknown, OpenAIChatRequestInput>, res) => {
      const { message, model } = req.body;
      let text: string;
      try {
        text = await callProvider({ provider: 'openai', model: model ?? 'gpt-4o' }, message);
      } catch (err) {
        throw toApiError(err);
      }
      res.json({ message: text });
    })
  );

  return router;
}
