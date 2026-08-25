import type { FinancialProfile } from '../types/index.js';

// Swapping the mock repository for Fi's real MCP Server later means
// implementing this interface once — route handlers never change.
export interface FinancialProfileRepository {
  getProfile(): Promise<FinancialProfile>;
}
