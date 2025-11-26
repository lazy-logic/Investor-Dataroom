'use client';

/**
 * Custom hooks for document operations
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient, APIClientError } from '@/lib/api-client';
import type { DocumentCategoryResponse, DocumentResponse } from '@/lib/api-types';

/**
 * Hook to fetch document categories
 */
export function useCategories(parentId?: string) {
  const [categories, setCategories] = useState<DocumentCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCategories(parentId);
      setCategories(data);
    } catch (err) {
      const message = err instanceof APIClientError ? err.message : 'Failed to fetch categories';
      setError(message);
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

/**
 * Hook to fetch documents by category
 */
export function useDocumentsByCategory(categoryId: string | null) {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!categoryId) {
      setDocuments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDocumentsByCategory(categoryId);
      setDocuments(data);
    } catch (err) {
      const message = err instanceof APIClientError ? err.message : 'Failed to fetch documents';
      setError(message);
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, refetch: fetchDocuments };
}

/**
 * Hook to fetch single document
 */
export function useDocument(documentId: string | null) {
  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setDocument(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDocument(documentId);
      setDocument(data);
    } catch (err) {
      const message = err instanceof APIClientError ? err.message : 'Failed to fetch document';
      setError(message);
      console.error('Failed to fetch document:', err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  return { document, loading, error, refetch: fetchDocument };
}

/**
 * Hook to handle document download
 */
export function useDocumentDownload() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadDocument = useCallback(async (documentId: string, fileName: string) => {
    try {
      setDownloading(true);
      setError(null);

      const blob = await apiClient.downloadDocument(documentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const message = err instanceof APIClientError ? err.message : 'Download failed';
      setError(message);
      console.error('Download failed:', err);
      throw err;
    } finally {
      setDownloading(false);
    }
  }, []);

  return { downloadDocument, downloading, error };
}

/**
 * Hook to handle document view
 */
export function useDocumentView() {
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewDocument = useCallback(async (documentId: string) => {
    try {
      setViewing(true);
      setError(null);

      const blob = await apiClient.viewDocument(documentId);
      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');

      // Cleanup after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      const message = err instanceof APIClientError ? err.message : 'View failed';
      setError(message);
      console.error('View failed:', err);
      throw err;
    } finally {
      setViewing(false);
    }
  }, []);

  return { viewDocument, viewing, error };
}
