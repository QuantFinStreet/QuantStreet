import { z } from 'zod';

export const loanQuerySchema = z.object({
  type: z.enum(['home', 'car', 'personal', 'education']),
  amount: z.number().min(10000, 'Minimum loan amount is ₹10,000').max(100_000_000, 'Maximum ₹10 Crore'),
  annualInterestRate: z.number().min(1, 'Minimum 1%').max(36, 'Maximum 36%'),
  tenureMonths: z.number().int().min(6, 'Minimum 6 months').max(360, 'Maximum 30 years'),
});

export type LoanQueryInput = z.infer<typeof loanQuerySchema>;
