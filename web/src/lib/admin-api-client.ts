import { APIClientError } from './api-client';
import type {
  PermissionLevelResponse,
  PermissionLevelCreate,
  PermissionLevelUpdate,
} from './api-types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : '';

export type AdminRole = 'super_admin' | 'admin' | 'user';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permission_level_id?: string | null;
  permission_level?: PermissionLevelResponse | null;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  user: unknown;
}

export interface AdminCreatePayload {
  email: string;
  password: string;
  full_name: string;
  role?: AdminRole;
  permission_level_id?: string | null;
}

export interface AdminUpdatePayload {
  full_name?: string | null;
  role?: AdminRole | null;
  is_active?: boolean | null;
  permission_level_id?: string | null;
}

export interface AdminAccessRequest {
  id: string;
  email?: string;
  full_name?: string;
  company?: string | null;
  status?: string;
  admin_notes?: string | null;
  requested_at?: string;
  reviewed_at?: string | null;
  expires_at?: string | null;
  [key: string]: unknown;
}

export interface AdminAccessRequestUpdatePayload {
  status: string;
  admin_notes?: string;
  expires_at?: string | null;
}

export interface AdminDocument {
  id: string;
  title?: string;
  description?: string | null;
  file_path?: string;
  file_url?: string;
  file_type?: string;
  categories?: string[];
  file_size?: number;
  uploaded_at?: string;
  uploaded_by?: string;
  tags?: string[];
  view_count?: number;
  download_count?: number;
  [key: string]: unknown;
}

export interface AdminUserPermissions {
  [key: string]: unknown;
}

class AdminAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;

    if (typeof window !== 'undefined') {
      this.token = window.localStorage.getItem('admin_access_token');
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('admin_access_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin_access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {};

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers as Record<string, string> | undefined),
        },
      });

      const contentType = response.headers.get('content-type');
      const isJSON = contentType !== null && contentType.includes('application/json');

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        let details: unknown = null;

        if (isJSON) {
          try {
            const data = await response.json();
            const anyData = data as { detail?: string };
            if (typeof anyData.detail === 'string') {
              message = anyData.detail;
            }
            details = data;
          } catch {
          }
        }

        throw new APIClientError(message, response.status, details);
      }

      if (isJSON) {
        return (await response.json()) as T;
      }

      return {} as T;
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error;
      }

      throw new APIClientError('Network error. Please check your connection.', 0, error);
    }
  }

  async register(payload: AdminCreatePayload): Promise<unknown> {
    return this.request<unknown>('/api/admin-auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const result = await this.request<AdminLoginResponse>('/api/admin-auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    });

    if (result.access_token) {
      this.setToken(result.access_token);
    }

    return result;
  }

  async getCurrentAdmin(): Promise<AdminUser> {
    return this.request<AdminUser>('/api/admin-auth/me', {
      method: 'GET',
    });
  }

  async listDocumentCategories(): Promise<string[]> {
    return this.request<string[]>('/api/documents/categories/list', {
      method: 'GET',
    });
  }

  async listDocuments(params?: {
    categories?: string;
    tags?: string;
    search?: string;
  }): Promise<AdminDocument[]> {
    let endpoint = '/api/documents/';

    if (params && (params.categories || params.tags || params.search)) {
      const searchParams = new URLSearchParams();
      if (params.categories) searchParams.set('categories', params.categories);
      if (params.tags) searchParams.set('tags', params.tags);
      if (params.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      endpoint = `/api/documents/?${query}`;
    }

    return this.request<AdminDocument[]>(endpoint, {
      method: 'GET',
    });
  }

  async getDocumentCategoryStats(): Promise<Record<string, number>> {
    return this.request<Record<string, number>>('/api/documents/stats/by-category', {
      method: 'GET',
    });
  }

  async getDocumentAccessLogs(documentId: string, limit: number = 50): Promise<unknown[]> {
    return this.request<unknown[]>(
      `/api/documents/${documentId}/access-logs?limit=${limit}`,
      {
        method: 'GET',
      },
    );
  }

  async updateCurrentAdmin(payload: { full_name: string }): Promise<unknown> {
    return this.request<unknown>('/api/admin-auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async changePassword(payload: { current_password: string; new_password: string }): Promise<unknown> {
    return this.request<unknown>('/api/admin-auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>('/api/admin/users', {
      method: 'GET',
    });
  }

  async createUser(payload: AdminCreatePayload): Promise<unknown> {
    return this.request<unknown>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getUser(userId: string): Promise<AdminUser> {
    return this.request<AdminUser>(`/api/admin/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateUser(userId: string, payload: AdminUpdatePayload): Promise<unknown> {
    return this.request<unknown>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deactivateUser(userId: string): Promise<unknown> {
    return this.request<unknown>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async activateUser(userId: string): Promise<unknown> {
    return this.request<unknown>(`/api/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  async listAccessRequests(requestStatus?: string): Promise<AdminAccessRequest[]> {
    const params = requestStatus ? `?request_status=${encodeURIComponent(requestStatus)}` : '';
    return this.request<AdminAccessRequest[]>(`/api/admin/access-requests${params}`, {
      method: 'GET',
    });
  }

  async updateAccessRequest(
    requestId: string,
    payload: AdminAccessRequestUpdatePayload,
  ): Promise<unknown> {
    return this.request<unknown>(`/api/admin/access-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async listPermissionLevels(): Promise<PermissionLevelResponse[]> {
    return this.request<PermissionLevelResponse[]>('/api/permissions/levels', {
      method: 'GET',
    });
  }

  async getPermissionLevel(levelId: string): Promise<PermissionLevelResponse> {
    return this.request<PermissionLevelResponse>(`/api/permissions/levels/${levelId}`, {
      method: 'GET',
    });
  }

  async createPermissionLevel(payload: PermissionLevelCreate): Promise<unknown> {
    return this.request<unknown>('/api/permissions/levels', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updatePermissionLevel(
    levelId: string,
    payload: PermissionLevelUpdate,
  ): Promise<unknown> {
    return this.request<unknown>(`/api/permissions/levels/${levelId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deletePermissionLevel(levelId: string): Promise<unknown> {
    return this.request<unknown>(`/api/permissions/levels/${levelId}`, {
      method: 'DELETE',
    });
  }

  async getUserPermissions(userId: string): Promise<AdminUserPermissions> {
    return this.request<AdminUserPermissions>(`/api/permissions/user/${userId}/permissions`, {
      method: 'GET',
    });
  }

  async uploadDocument(formData: FormData): Promise<AdminDocument> {
    const headers: Record<string, string> = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/documents/`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      const isJSON = contentType !== null && contentType.includes('application/json');

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        let details: unknown = null;

        if (isJSON) {
          try {
            const data = await response.json();
            const anyData = data as { detail?: string };
            if (typeof anyData.detail === 'string') {
              message = anyData.detail;
            }
            details = data;
          } catch {
          }
        }

        throw new APIClientError(message, response.status, details);
      }

      if (isJSON) {
        return (await response.json()) as AdminDocument;
      }

      return { id: '' } as AdminDocument;
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error;
      }

      throw new APIClientError('Network error. Please check your connection.', 0, error);
    }
  }

  async getDocument(documentId: string): Promise<AdminDocument> {
    return this.request<AdminDocument>(`/api/documents/${documentId}`, {
      method: 'GET',
    });
  }

  async getDocumentUrl(documentId: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      `/api/documents/${documentId}/url`,
      {
        method: 'GET',
      },
    );
  }

  async deleteDocument(documentId: string): Promise<unknown> {
    return this.request<unknown>(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
  }
}

export const adminApiClient = new AdminAPIClient();

export default AdminAPIClient;
