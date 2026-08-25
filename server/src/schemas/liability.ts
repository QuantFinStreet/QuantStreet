import { z } from 'zod';

const loanTypeSchema = z.enum(['home', 'car', 'personal', 'education']);

export const liabilityInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  type: loanTypeSchema,
  outstandingAmount: z.number().min(0, 'Must be 0 or more'),
  originalAmount: z.number().min(0, 'Must be 0 or more'),
  interestRate: z.number().min(0).max(100, 'Must be between 0 and 100'),
  monthlyEMI: z.number().min(0, 'Must be 0 or more'),
  remainingMonths: z.number().int().min(0, 'Must be 0 or more'),
  startDate: z.string().trim().min(1, 'Date is required'),
});

export const liabilityUpdateSchema = liabilityInputSchema.partial();

export type LiabilityInputBody = z.infer<typeof liabilityInputSchema>;
export type LiabilityUpdateBody = z.infer<typeof liabilityUpdateSchema>;
