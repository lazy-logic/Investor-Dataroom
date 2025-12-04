/**
 * API Client for SAYeTECH Investor Dataroom
 * Based on OpenAPI spec v2.1.0
 */

import type {
  OTPRequest,
  OTPVerify,
  TokenResponse,
  NDAContent,
  NDAAcceptance,
  NDAStatus,
  DocumentResponse,
  AccessRequestUpdate,
  PermissionLevelResponse,
  QuestionCreate,
  QAThreadResponse,
  ExecutiveSummary,
  KeyMetric,
  Milestone,
  Testimonial,
  Award,
  MediaCoverage,
} from './api-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dataroom-backend-api.onrender.com';

// Response type for OTP requests
interface OTPResponseData {
  success: boolean;
  message: string;
  expires_in_minutes?: number;
  purpose?: string;
}

// Access request type
interface AccessRequestData {
  id: string;
  email: string;
  full_name: string;
  company: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

// Admin response type
interface AdminResponse {
  id: string;
  email: string;
  username?: string | null;
  full_name: string;
  role: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Custom API Error class
 */
export class APIClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

/**
 * Main API Client class
 */
export class APIClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, timeout: number = 30000): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('content-type');
      const isJSON = contentType?.includes('application/json');

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        if (isJSON) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
          throw new APIClientError(errorMessage, response.status, errorData);
        }
        throw new APIClientError(errorMessage, response.status);
      }

      if (isJSON) {
        return await response.json();
      }
      return {} as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof APIClientError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIClientError('Request timed out. Please try again.', 0, error);
      }
      throw new APIClientError('Network error. Please check your connection.', 0, error);
    }
  }

  private async downloadFile(endpoint: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!response.ok) {
      throw new APIClientError(`Download failed: HTTP ${response.status}`, response.status);
    }
    return response.blob();
  }

  // ==================== OTP Endpoints ====================

  /** POST /api/otp/request */
  async requestOTP(email: string, purpose: string = 'access_request'): Promise<OTPResponseData> {
    return this.request<OTPResponseData>('/api/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email, purpose } as OTPRequest),
    });
  }

  /** POST /api/otp/verify */
  async verifyOTP(email: string, otp_code: string, purpose: string = 'login'): Promise<{
    success?: boolean;
    message?: string;
    access_token?: string;
    token_type?: string;
    user?: Record<string, unknown>;
    user_id?: string;
    user_email?: string;
    access_request_id?: string;
  }> {
    const data = await this.request<{
      success?: boolean;
      message?: string;
      access_token?: string;
      token_type?: string;
      user?: Record<string, unknown>;
      user_id?: string;
      user_email?: string;
      access_request_id?: string;
    }>('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code, purpose } as OTPVerify),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  /** POST /api/otp/resend */
  async resendOTP(email: string, purpose: string = 'access_request'): Promise<OTPResponseData> {
    return this.request<OTPResponseData>('/api/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ email, purpose } as OTPRequest),
    });
  }

  // ==================== Authentication Endpoints ====================

  /** GET /api/admin-auth/me */
  async getCurrentUser(): Promise<AdminResponse> {
    return this.request<AdminResponse>('/api/admin-auth/me', { method: 'GET' });
  }

  // ==================== Access Request Endpoints ====================

  /** POST /api/access-requests/ */
  async submitAccessRequest(data: {
    email: string;
    full_name: string;
    company: string;
    phone?: string | null;
    message?: string | null;
  }): Promise<{ id: string; message?: string }> {
    return this.request<{ id: string; message?: string }>('/api/access-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** GET /api/access-requests/check/{email} */
  async checkAccessRequestStatus(email: string): Promise<{ exists: boolean; status?: string }> {
    return this.request(`/api/access-requests/check/${encodeURIComponent(email)}`, { method: 'GET' });
  }

  /** GET /api/access-requests/{request_id} */
  async getAccessRequest(requestId: string): Promise<AccessRequestData> {
    return this.request<AccessRequestData>(`/api/access-requests/${requestId}`, { method: 'GET' });
  }

  // ==================== NDA Endpoints ====================

  /** GET /api/nda/content */
  async getNDAContent(): Promise<NDAContent> {
    return this.request<NDAContent>('/api/nda/content', { method: 'GET' });
  }

  /** POST /api/nda/accept */
  async acceptNDA(data: NDAAcceptance): Promise<{ message: string }> {
    return this.request('/api/nda/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** GET /api/nda/status */
  async checkNDAStatus(): Promise<NDAStatus> {
    return this.request<NDAStatus>('/api/nda/status', { method: 'GET' });
  }

  // ==================== Document Endpoints ====================

  /** GET /api/documents/categories/list */
  async getCategoriesList(): Promise<string[]> {
    return this.request<string[]>('/api/documents/categories/list', { method: 'GET' });
  }

  /** GET /api/documents/ */
  async listDocuments(params?: { categories?: string; tags?: string; search?: string }): Promise<DocumentResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.categories) searchParams.set('categories', params.categories);
    if (params?.tags) searchParams.set('tags', params.tags);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return this.request<DocumentResponse[]>(`/api/documents/${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  /** GET /api/documents/by-category/{category} */
  async getDocumentsByCategory(category: string): Promise<DocumentResponse[]> {
    return this.request<DocumentResponse[]>(`/api/documents/by-category/${encodeURIComponent(category)}`, { method: 'GET' });
  }

  /** GET /api/documents/{document_id} */
  async getDocument(documentId: string): Promise<DocumentResponse> {
    return this.request<DocumentResponse>(`/api/documents/${documentId}`, { method: 'GET' });
  }

  /** GET /api/documents/{document_id}/url */
  async getDocumentUrl(documentId: string): Promise<{ url: string }> {
    return this.request(`/api/documents/${documentId}/url`, { method: 'GET' });
  }

  /** GET /api/documents/{document_id}/download */
  async downloadDocument(documentId: string): Promise<Blob> {
    return this.downloadFile(`/api/documents/${documentId}/download`);
  }

  // ==================== Admin Endpoints ====================

  /** GET /api/admin/access-requests */
  async getAccessRequests(status?: string): Promise<AccessRequestData[]> {
    const params = status ? `?request_status=${status}` : '';
    return this.request<AccessRequestData[]>(`/api/admin/access-requests${params}`, { method: 'GET' });
  }

  /** PUT /api/admin/access-requests/{request_id} */
  async updateAccessRequest(requestId: string, data: AccessRequestUpdate): Promise<{ message: string }> {
    return this.request(`/api/admin/access-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** GET /api/documents/{document_id}/access-logs */
  async getDocumentAccessLogs(documentId: string, limit: number = 50): Promise<unknown[]> {
    return this.request(`/api/documents/${documentId}/access-logs?limit=${limit}`, { method: 'GET' });
  }

  /** GET /api/documents/stats/by-category */
  async getCategoryStats(): Promise<Record<string, number>> {
    return this.request('/api/documents/stats/by-category', { method: 'GET' });
  }

  // ==================== Permission Endpoints ====================

  /** GET /api/permissions/levels */
  async getPermissionLevels(): Promise<PermissionLevelResponse[]> {
    return this.request<PermissionLevelResponse[]>('/api/permissions/levels', { method: 'GET' });
  }

  /** GET /api/permissions/levels/{level_id} */
  async getPermissionLevel(levelId: string): Promise<PermissionLevelResponse> {
    return this.request<PermissionLevelResponse>(`/api/permissions/levels/${levelId}`, { method: 'GET' });
  }

  /** GET /api/permissions/user/{user_id}/permissions */
  async getUserPermissions(userId: string): Promise<unknown> {
    return this.request(`/api/permissions/user/${userId}/permissions`, { method: 'GET' });
  }

  // ==================== Q&A Endpoints ====================

  /** POST /api/qa/questions */
  async submitQuestion(data: QuestionCreate): Promise<{ id: string; message?: string }> {
    return this.request('/api/qa/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** GET /api/qa/threads */
  async getQAThreads(): Promise<QAThreadResponse[]> {
    return this.request<QAThreadResponse[]>('/api/qa/threads', { method: 'GET' });
  }

  /** GET /api/qa/search */
  async searchQA(query: string): Promise<QAThreadResponse[]> {
    return this.request<QAThreadResponse[]>(`/api/qa/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
  }

  // ==================== Company Information Endpoints ====================

  /** GET /api/company/executive-summary */
  async getExecutiveSummary(): Promise<ExecutiveSummary> {
    return this.request<ExecutiveSummary>('/api/company/executive-summary', { method: 'GET' });
  }

  /** GET /api/company/metrics */
  async getKeyMetrics(): Promise<KeyMetric[]> {
    return this.request<KeyMetric[]>('/api/company/metrics', { method: 'GET' });
  }

  /** GET /api/company/milestones */
  async getMilestones(): Promise<Milestone[]> {
    return this.request<Milestone[]>('/api/company/milestones', { method: 'GET' });
  }

  /** GET /api/company/testimonials */
  async getTestimonials(featuredOnly: boolean = false): Promise<Testimonial[]> {
    return this.request<Testimonial[]>(`/api/company/testimonials${featuredOnly ? '?featured_only=true' : ''}`, { method: 'GET' });
  }

  /** GET /api/company/awards */
  async getAwards(): Promise<Award[]> {
    return this.request<Award[]>('/api/company/awards', { method: 'GET' });
  }

  /** GET /api/company/media-coverage */
  async getMediaCoverage(): Promise<MediaCoverage[]> {
    return this.request<MediaCoverage[]>('/api/company/media-coverage', { method: 'GET' });
  }

  // ==================== Health Check ====================

  /** GET /health */
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health', { method: 'GET' });
  }
}

export const apiClient = new APIClient();
export default APIClient;
