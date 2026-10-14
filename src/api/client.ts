import {
  ApiResponse,
  DashboardStats,
  MedicalCase,
  PaginatedData,
  TestResultItem,
  User,
} from '../types/index.ts';

const TOKEN_KEY = 'medcase_token';
const USER_KEY = 'medcase_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; errors?: Record<string, string[]>; status: number }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const json: ApiResponse<T> = isJson ? await res.json() : null;

    if (!res.ok) {
      if (res.status === 401) {
        clearStoredAuth();
      }
      return {
        error: json?.message || `Request failed with status ${res.status}`,
        errors: json?.errors,
        status: res.status,
      };
    }

    return {
      data: json?.data as T,
      status: res.status,
    };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : 'Network error occurred',
      status: 0,
    };
  }
}

export const api = {
  async login(email: string, password: string) {
    const res = await request<{ token: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token && res.data.user) {
      setStoredAuth(res.data.token, res.data.user);
    }
    return res;
  },

  async logout() {
    await request('/api/logout', { method: 'POST' });
    clearStoredAuth();
  },

  async getMe() {
    return request<User>('/api/user');
  },

  async getDashboardStats() {
    return request<DashboardStats>('/api/dashboard/stats');
  },

  async getCases(params: {
    page?: number;
    per_page?: number;
    search?: string;
    surgeon?: string;
    status?: string;
    priority?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.per_page) query.set('per_page', params.per_page.toString());
    if (params.search) query.set('search', params.search);
    if (params.surgeon) query.set('surgeon', params.surgeon);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);

    return request<PaginatedData<MedicalCase>>(`/api/cases?${query.toString()}`);
  },

  async getCase(id: number) {
    return request<MedicalCase>(`/api/cases/${id}`);
  },

  async createCase(payload: Omit<MedicalCase, 'id' | 'created_by' | 'created_at' | 'updated_at'>) {
    return request<MedicalCase>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCase(
    id: number,
    payload: Partial<Omit<MedicalCase, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
  ) {
    return request<MedicalCase>(`/api/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteCase(id: number) {
    return request<null>(`/api/cases/${id}`, {
      method: 'DELETE',
    });
  },

  async runTests() {
    return request<{
      passedCount: number;
      totalCount: number;
      results: TestResultItem[];
    }>('/api/run-tests');
  },

  async resetDatabase() {
    return request<null>('/api/database/reset', { method: 'POST' });
  },
};
