// Core domain models derived from 03-implementation-plan.md

export type InvestorType =
  | "angel"
  | "vc"
  | "family-office"
  | "strategic"
  | "other";

export interface InvestorProfile {
  id: string; // user id from auth system
  fullName: string;
  organization: string;
  roleTitle: string;
  investorType: InvestorType;
  createdAt: string;
  updatedAt: string;
}

export type RoleName = "admin" | "investor";

export interface Role {
  id: string;
  name: RoleName;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
}

export type PermissionLevelName =
  | "VIEW_ONLY"
  | "DOWNLOAD_ALLOWED"
  | "EXPIRY_CONTROLLED";

export interface PermissionLevel {
  id: string;
  name: PermissionLevelName;
}

export interface InvestorPermission {
  id: string;
  userId: string;
  permissionLevelId: string;
  accessExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NdaTemplate {
  id: string;
  version: string;
  title: string;
  body: string; // markdown or HTML
  isActive: boolean;
  createdAt: string;
}

export interface NdaAcceptance {
  id: string;
  userId: string;
  ndaId: string;
  fullName: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description?: string;
}

export interface DocumentRecord {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  isDownloadable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersionRecord {
  id: string;
  documentId: string;
  versionNumber: number;
  storagePath: string; // backend storage key
  fileSizeBytes: number;
  uploadedBy: string; // user id
  uploadedAt: string;
}

export type AccessRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "DENIED"
  | "NEED_INFO";

export interface AccessRequestRecord {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  roleTitle: string;
  investorType: InvestorType;
  message?: string;
  status: AccessRequestStatus;
  decisionReason?: string;
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export type DocumentActivityAction = "VIEWED" | "DOWNLOADED";

export interface DocumentActivityRecord {
  id: string;
  userId: string;
  documentId: string;
  documentVersionId: string;
  action: DocumentActivityAction;
  ipAddress: string;
  createdAt: string;
}
