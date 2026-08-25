import type {
  Asset,
  AssetInput,
  AssetsResponse,
  CreditScoreResponse,
  FinancialProfile,
  Liability,
  LiabilityInput,
  LiabilitiesResponse,
  NetWorthResponse,
} from '@fintech/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export const getProfile = () => apiGet<FinancialProfile>('/api/profile');
export const getNetWorth = () => apiGet<NetWorthResponse>('/api/profile/net-worth');
export const getAssets = () => apiGet<AssetsResponse>('/api/profile/assets');
export const getLiabilities = () => apiGet<LiabilitiesResponse>('/api/profile/liabilities');
export const getCreditScore = () => apiGet<CreditScoreResponse>('/api/profile/credit-score');

export const createAsset = (input: AssetInput) => apiPost<Asset>('/api/profile/assets', input);
export const updateAsset = (id: string, updates: Partial<AssetInput>) =>
  apiPatch<Asset>(`/api/profile/assets/${id}`, updates);
export const deleteAsset = (id: string) => apiDelete(`/api/profile/assets/${id}`);

export const createLiability = (input: LiabilityInput) => apiPost<Liability>('/api/profile/liabilities', input);
export const updateLiability = (id: string, updates: Partial<LiabilityInput>) =>
  apiPatch<Liability>(`/api/profile/liabilities/${id}`, updates);
export const deleteLiability = (id: string) => apiDelete(`/api/profile/liabilities/${id}`);
