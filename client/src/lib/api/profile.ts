import type {
  AssetsResponse,
  CreditScoreResponse,
  FinancialProfile,
  LiabilitiesResponse,
  NetWorthResponse,
} from '@fintech/shared';
import { apiGet } from './client';

export const getProfile = () => apiGet<FinancialProfile>('/api/profile');
export const getNetWorth = () => apiGet<NetWorthResponse>('/api/profile/net-worth');
export const getAssets = () => apiGet<AssetsResponse>('/api/profile/assets');
export const getLiabilities = () => apiGet<LiabilitiesResponse>('/api/profile/liabilities');
export const getCreditScore = () => apiGet<CreditScoreResponse>('/api/profile/credit-score');
