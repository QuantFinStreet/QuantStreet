import type { Asset, AssetInput, FinancialProfile, Liability, LiabilityInput } from '../types/index.js';

// Thrown when an update/delete targets an id that doesn't exist — routes
// map this to a 404 without needing to know how the repository is implemented.
export class RepositoryNotFoundError extends Error {}

// Swapping the mock repository for Fi's real MCP Server later means
// implementing this interface once — route handlers never change.
export interface FinancialProfileRepository {
  getProfile(): Promise<FinancialProfile>;

  addAsset(input: AssetInput): Promise<Asset>;
  updateAsset(id: string, updates: Partial<AssetInput>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  addLiability(input: LiabilityInput): Promise<Liability>;
  updateLiability(id: string, updates: Partial<LiabilityInput>): Promise<Liability>;
  deleteLiability(id: string): Promise<void>;
}
