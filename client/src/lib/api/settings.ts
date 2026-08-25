import type { ApiErrorResponse, ExportFormat, FinancialProfile } from '@fintech/shared';
import { ApiRequestError } from './client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// json responses come back parsed; csv/pdf come back as a downloadable Blob —
// callers branch on `format` to know which shape they'll get.
export async function exportProfile(
  format: ExportFormat
): Promise<FinancialProfile | Blob> {
  const res = await fetch(`${API_BASE_URL}/api/settings/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiRequestError(
      res.status,
      body ?? { error: 'unknown_error', message: `Request failed with status ${res.status}` }
    );
  }

  return format === 'json' ? ((await res.json()) as FinancialProfile) : res.blob();
}
