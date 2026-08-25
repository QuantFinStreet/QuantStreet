import type { LoanQuery, LoanResult } from '@fintech/shared';
import { apiPost } from './client';

export const calculateLoan = (query: LoanQuery) =>
  apiPost<LoanResult>('/api/loan/calculate', query);
