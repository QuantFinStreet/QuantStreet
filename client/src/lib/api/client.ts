import type { ApiErrorResponse } from '@fintech/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(status: number, body: ApiErrorResponse) {
    super(body.message);
    this.status = status;
    this.code = body.error;
    this.details = body.details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiRequestError(
      res.status,
      body ?? { error: 'unknown_error', message: `Request failed with status ${res.status}` }
    );
  }

  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}
