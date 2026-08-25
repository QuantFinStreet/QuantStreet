import { z } from 'zod';

const assetCategorySchema = z.enum([
  'mutual_fund',
  'stock',
  'fixed_deposit',
  'gold',
  'ppf',
  'real_estate',
  'savings',
  'crypto',
]);

export const assetInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  category: assetCategorySchema,
  currentValue: z.number().min(0, 'Must be 0 or more'),
  purchaseValue: z.number().min(0, 'Must be 0 or more'),
  lastUpdated: z.string().trim().min(1, 'Date is required'),
});

export const assetUpdateSchema = assetInputSchema.partial();

export type AssetInputBody = z.infer<typeof assetInputSchema>;
export type AssetUpdateBody = z.infer<typeof assetUpdateSchema>;
