/**
 * TypeScript type definitions for SAYeTECH Investor Dataroom API
 * Based on OpenAPI specification v2.0.0
 */

// ==================== Authentication Types ====================

export interface OTPRequest {
  email: string;
}

export interface OTPResponse {
  message: string;
  expires_at: string;
  attempts_remaining: number;
}

export interface OTPVerify {
  email: string;
  otp_code: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: Record<string, unknown>;
}

// ==================== User Types ====================

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role_id: string;
  permission_level_id: number;
  created_at: string;
  updated_at: string;
}

// ==================== NDA Types ====================

export interface NDAContent {
  version: string;
  content: string;
  effective_date: string;
}

export interface NDAAcceptance {
  digital_signature: string;
  ip_address: string;
  user_agent: string;
}

export interface NDAStatus {
  accepted: boolean;
  accepted_at?: string;
  version?: string;
  nda_id?: string;
}

// ==================== Document Types ====================

export interface DocumentCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_category_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DocumentCategoryCreate {
  name: string;
  slug: string;
  description?: string | null;
  parent_category_id?: string | null;
  sort_order?: number;
}

export interface DocumentResponse {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  version_number: number;
  is_latest_version: boolean;
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
}

export interface DocumentUpload {
  file: File;
  title: string;
  category_id: string;
  description?: string | null;
}

// ==================== Access Request Types ====================

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  status: 'pending' | 'approved' | 'denied';
  admin_notes?: string;
  requested_at: string;
  reviewed_at?: string;
  expires_at?: string;
}

export interface AccessRequestUpdate {
  status: 'pending' | 'approved' | 'denied';
  admin_notes?: string;
  expires_at?: string;
}

// ==================== Permission Types ====================

export interface PermissionLevelResponse {
  id: string;
  name: string;
  description: string;
  can_view: boolean;
  can_download: boolean;
  has_expiry: boolean;
  max_downloads: number | null;
  created_at: string;
}

export interface PermissionLevelCreate {
  name: string;
  description: string;
  can_view?: boolean;
  can_download?: boolean;
  has_expiry?: boolean;
  max_downloads?: number | null;
}

export interface PermissionLevelUpdate {
  name?: string;
  description?: string;
  can_view?: boolean;
  can_download?: boolean;
  has_expiry?: boolean;
  max_downloads?: number | null;
}

// ==================== Error Types ====================

export interface APIError {
  detail: string;
  status_code?: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// ==================== API Response Types ====================

export interface APIResponse<T> {
  data?: T;
  error?: APIError;
  success: boolean;
}

// ==================== Utility Types ====================

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: SortOrder;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
