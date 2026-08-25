import type { FinancialProfileRepository } from '../data/financialProfileRepository.js';
import { testProfile } from './fixtures.js';

export class TestFinancialProfileRepository implements FinancialProfileRepository {
  async getProfile() {
    return testProfile;
  }
}
