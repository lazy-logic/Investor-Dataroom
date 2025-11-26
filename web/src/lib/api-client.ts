/**
 * API Client for SAYeTECH Investor Dataroom
 * Handles all HTTP requests with proper error handling and authentication
 */

import type {
  OTPRequest,
  OTPResponse,
  OTPVerify,
  TokenResponse,
  UserResponse,
  NDAContent,
  NDAAcceptance,
  NDAStatus,
  DocumentCategoryResponse,
  DocumentResponse,
  AccessRequest,
  AccessRequestUpdate,
  PermissionLevelResponse,
  APIError,
} from './api-types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : '';

/**
 * Custom API Error class for better error handling
 */
export class APIClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

/**
 * Main API Client class
 */
export class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Generic request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJSON = contentType?.includes('application/json');

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails = null;

        if (isJSON) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
            errorDetails = errorData;
          } catch (e) {
            // Failed to parse error JSON
          }
        }

        throw new APIClientError(errorMessage, response.status, errorDetails);
      }

      // Return parsed JSON or empty object
      if (isJSON) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error;
      }

      // Network or other errors
      throw new APIClientError(
        'Network error. Please check your connection.',
        0,
        error
      );
    }
  }

  /**
   * Handle file downloads
   */
  private async downloadFile(endpoint: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, { headers });

      if (!response.ok) {
        throw new APIClientError(`Download failed: HTTP ${response.status}`, response.status);
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error;
      }
      throw new APIClientError('Failed to download file', 0, error);
    }
  }

  // ==================== Authentication Endpoints ====================

  /**
   * Request OTP for email login
   */
  async requestOTP(email: string): Promise<OTPResponse> {
    return this.request<OTPResponse>('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email } as OTPRequest),
    });
  }

  /**
   * Verify OTP and get access token
   */
  async verifyOTP(email: string, otp_code: string): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code } as OTPVerify),
    });
    
    // Automatically set token after successful verification
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  /**
   * Demo auto-login for investor preview
   * Skips OTP and NDA steps and returns a mock access token
   */
  async demoAutoLogin(email: string): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/api/demo/auto-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/api/auth/me', {
      method: 'GET',
    });
  }

  // ==================== NDA Endpoints ====================

  /**
   * Get current NDA content
   */
  async getNDAContent(): Promise<NDAContent> {
    return this.request<NDAContent>('/api/nda/content', {
      method: 'GET',
    });
  }

  /**
   * Accept NDA agreement
   */
  async acceptNDA(data: NDAAcceptance): Promise<{ message: string }> {
    return this.request('/api/nda/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Check if user has accepted NDA
   */
  async checkNDAStatus(): Promise<NDAStatus> {
    return this.request<NDAStatus>('/api/nda/status', {
      method: 'GET',
    });
  }

  // ==================== Document Endpoints ====================

  /**
   * Get all document categories
   */
  async getCategories(parent_id?: string): Promise<DocumentCategoryResponse[]> {
    const params = parent_id ? `?parent_id=${parent_id}` : '';
    return this.request<DocumentCategoryResponse[]>(`/api/documents/categories${params}`, {
      method: 'GET',
    });
  }

  /**
   * Get specific category
   */
  async getCategory(category_id: string): Promise<DocumentCategoryResponse> {
    return this.request<DocumentCategoryResponse>(`/api/documents/categories/${category_id}`, {
      method: 'GET',
    });
  }

  /**
   * Get subcategories of a category
   */
  async getSubcategories(category_id: string): Promise<DocumentCategoryResponse[]> {
    return this.request<DocumentCategoryResponse[]>(
      `/api/documents/categories/${category_id}/subcategories`,
      { method: 'GET' }
    );
  }

  /**
   * Get documents by category
   */
  async getDocumentsByCategory(category_id: string): Promise<DocumentResponse[]> {
    return this.request<DocumentResponse[]>(
      `/api/documents/category/${category_id}/documents`,
      { method: 'GET' }
    );
  }

  /**
   * Get specific document details
   */
  async getDocument(document_id: string): Promise<DocumentResponse> {
    return this.request<DocumentResponse>(`/api/documents/${document_id}`, {
      method: 'GET',
    });
  }

  /**
   * Download a document
   */
  async downloadDocument(document_id: string): Promise<Blob> {
    return this.downloadFile(`/api/documents/${document_id}/download`);
  }

  /**
   * View a document (for PDFs and images)
   */
  async viewDocument(document_id: string): Promise<Blob> {
    return this.downloadFile(`/api/documents/${document_id}/view`);
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(document_id: string): Promise<any[]> {
    return this.request<any[]>(`/api/documents/${document_id}/versions`, {
      method: 'GET',
    });
  }

  /**
   * Upload a document (Admin only)
   */
  async uploadDocument(formData: FormData): Promise<{ message: string; document_id: string }> {
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/api/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIClientError(error.detail || 'Upload failed', response.status);
    }

    return response.json();
  }

  // ==================== Access Request Endpoints ====================

  /**
   * Submit access request (Public endpoint)
   * NOTE: This endpoint doesn't exist in the current backend API
   * For now, this will return a mock response
   * TODO: Backend needs to implement POST /api/access-requests
   */
  async submitAccessRequest(data: {
    name: string;
    email: string;
    company?: string;
    message?: string;
  }): Promise<{ message: string; request_id: string }> {
    // Call local mock API route so the request appears as a normal 200 in the Network panel
    return this.request<{ message: string; request_id: string }>('/api/access-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Admin Endpoints ====================

  /**
   * Get access requests (Admin only)
   */
  async getAccessRequests(status?: string): Promise<AccessRequest[]> {
    const params = status ? `?status=${status}` : '';
    return this.request<AccessRequest[]>(`/api/admin/access-requests${params}`, {
      method: 'GET',
    });
  }

  /**
   * Update access request (Admin only)
   */
  async updateAccessRequest(
    request_id: string,
    data: AccessRequestUpdate
  ): Promise<{ message: string }> {
    return this.request(`/api/admin/access-requests/${request_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get document access logs (Admin only)
   */
  async getDocumentAccessLogs(document_id: string, limit: number = 50): Promise<any[]> {
    return this.request<any[]>(
      `/api/documents/${document_id}/access-logs?limit=${limit}`,
      { method: 'GET' }
    );
  }

  // ==================== Permission Endpoints ====================

  /**
   * Get all permission levels
   */
  async getPermissionLevels(): Promise<PermissionLevelResponse[]> {
    return this.request<PermissionLevelResponse[]>('/api/permissions/levels', {
      method: 'GET',
    });
  }

  /**
   * Get specific permission level
   */
  async getPermissionLevel(level_id: string): Promise<PermissionLevelResponse> {
    return this.request<PermissionLevelResponse>(`/api/permissions/levels/${level_id}`, {
      method: 'GET',
    });
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(user_id: string): Promise<any> {
    return this.request(`/api/permissions/user/${user_id}/permissions`, {
      method: 'GET',
    });
  }

  // ==================== Health Check ====================

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health', {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing or multiple instances
export default APIClient;
