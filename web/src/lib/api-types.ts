/**
 * TypeScript type definitions for SAYeTECH Investor Dataroom API
 * Based on OpenAPI specification v2.0.0
 */

// ==================== Authentication Types ====================

export interface OTPRequest {
  email: string;
  purpose?: 'access_request' | 'investor_login' | string;
}

export interface OTPResponse {
  message: string;
  expires_at: string;
  attempts_remaining: number;
}

export interface OTPVerify {
  email: string;
  otp_code: string;
  purpose?: 'access_request' | 'investor_login' | string;
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

/**
 * Document category - since backend returns string[] for categories,
 * this is a compatibility type for components that expect objects
 */
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

/**
 * Document response matching OpenAPI DocumentResponse schema
 */
export interface DocumentResponse {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_url: string;
  file_type: string;
  categories: string[];
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  tags: string[];
  view_count?: number;
  download_count?: number;
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

// ==================== Q&A Types ====================

export interface QuestionCreate {
  question_text: string;
  category: string;
  is_urgent?: boolean;
}

export interface AnswerCreate {
  answer_text: string;
  is_public?: boolean;
}

export interface QAThreadResponse {
  id: string;
  question_text: string;
  category: string;
  asked_by: string;
  asked_at: string;
  answer_text?: string | null;
  answered_by?: string | null;
  answered_at?: string | null;
  is_public: boolean;
  is_urgent: boolean;
  status: string;
}

// ==================== Company Information Types ====================

export interface ExecutiveSummary {
  title?: string;
  tagline?: string;
  description?: string;
  highlights?: string[];
  [key: string]: unknown;
}

export interface KeyMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  [key: string]: unknown;
}

export interface Milestone {
  id?: string;
  date: string;
  title: string;
  description?: string;
  [key: string]: unknown;
}

export interface Testimonial {
  id?: string;
  author: string;
  role?: string;
  company?: string;
  content: string;
  featured?: boolean;
  [key: string]: unknown;
}

export interface Award {
  id?: string;
  title: string;
  organization?: string;
  year?: string | number;
  description?: string;
  [key: string]: unknown;
}

export interface MediaCoverage {
  id?: string;
  title: string;
  publication: string;
  date?: string;
  url?: string;
  excerpt?: string;
  [key: string]: unknown;
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
