import { randomUUID } from 'node:crypto';
import type { Asset, AssetInput, FinancialProfile, Liability, LiabilityInput } from '../types/index.js';
import { RepositoryNotFoundError, type FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { testProfile } from './fixtures.js';

export class TestFinancialProfileRepository implements FinancialProfileRepository {
  private profile: FinancialProfile = structuredClone(testProfile);

  async getProfile(): Promise<FinancialProfile> {
    return this.profile;
  }

  async addAsset(input: AssetInput): Promise<Asset> {
    const asset: Asset = { id: randomUUID(), ...input };
    this.profile.assets.push(asset);
    return asset;
  }

  async updateAsset(id: string, updates: Partial<AssetInput>): Promise<Asset> {
    const asset = this.profile.assets.find((a) => a.id === id);
    if (!asset) throw new RepositoryNotFoundError(`Asset ${id} not found.`);
    Object.assign(asset, updates);
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    const index = this.profile.assets.findIndex((a) => a.id === id);
    if (index === -1) throw new RepositoryNotFoundError(`Asset ${id} not found.`);
    this.profile.assets.splice(index, 1);
  }

  async addLiability(input: LiabilityInput): Promise<Liability> {
    const liability: Liability = { id: randomUUID(), ...input };
    this.profile.liabilities.push(liability);
    return liability;
  }

  async updateLiability(id: string, updates: Partial<LiabilityInput>): Promise<Liability> {
    const liability = this.profile.liabilities.find((l) => l.id === id);
    if (!liability) throw new RepositoryNotFoundError(`Liability ${id} not found.`);
    Object.assign(liability, updates);
    return liability;
  }

  async deleteLiability(id: string): Promise<void> {
    const index = this.profile.liabilities.findIndex((l) => l.id === id);
    if (index === -1) throw new RepositoryNotFoundError(`Liability ${id} not found.`);
    this.profile.liabilities.splice(index, 1);
  }
}
