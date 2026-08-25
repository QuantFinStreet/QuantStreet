import { z } from 'zod';

export const exportRequestSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
});

export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
