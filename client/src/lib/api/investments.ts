import type { AllocationResponse, SIPResponse } from '@fintech/shared';
import { apiGet } from './client';

export const getSIPHoldings = () => apiGet<SIPResponse>('/api/investments/sip');
export const getPortfolioAllocation = () => apiGet<AllocationResponse>('/api/investments/allocation');
