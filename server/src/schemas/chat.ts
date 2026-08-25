import { z } from 'zod';

const queryTypeSchema = z.enum(['loan', 'investment', 'general', 'complex_analysis', 'quick_advice']);

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message is too long (max 2000 characters)'),
  // Optional client hint — the server classifies independently and this
  // is not trusted for routing, only echoed back if provided.
  queryType: queryTypeSchema.optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

export const openAIChatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message is too long (max 2000 characters)'),
  model: z.string().min(1).optional(),
});

export type OpenAIChatRequestInput = z.infer<typeof openAIChatRequestSchema>;
