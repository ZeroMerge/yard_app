import { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('yard_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('yard_token', token);
  } else {
    localStorage.removeItem('yard_token');
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || json.error) {
      const errorMsg = json.error?.message || `HTTP error ${response.status}: ${response.statusText}`;
      const errorCode = json.error?.code || `HTTP_${response.status}`;
      throw new ApiError(errorCode, errorMsg, json.error?.details);
    }

    return json.data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('NETWORK_ERROR', err.message || 'Failed to connect to backend server');
  }
}
