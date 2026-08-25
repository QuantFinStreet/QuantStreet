import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { FinancialProfile } from '@fintech/shared';
import { getProfile } from '../lib/api/profile';

interface DataContextValue {
  profile: FinancialProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getProfile()
      .then(setProfile)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load financial profile.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <DataContext.Provider value={{ profile, isLoading, error, refreshProfile }}>
      {children}
    </DataContext.Provider>
  );
}

// For loading/error boundaries (e.g. AppLayout) that render before the
// profile has arrived — profile is nullable here.
export function useFinancialDataStatus(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useFinancialDataStatus must be used inside <DataProvider>');
  return ctx;
}

// For pages rendered inside the routed <Outlet>, which AppLayout only ever
// mounts once the profile has finished loading — profile is guaranteed
// non-null here, matching the shape pages relied on before this API existed.
export function useFinancialData(): Omit<DataContextValue, 'profile'> & { profile: FinancialProfile } {
  const ctx = useFinancialDataStatus();
  if (!ctx.profile) {
    throw new Error('useFinancialData called before the profile finished loading — use useFinancialDataStatus for loading/error UI.');
  }
  return { ...ctx, profile: ctx.profile };
}
