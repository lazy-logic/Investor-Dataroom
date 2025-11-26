'use client';

/**
 * Authentication Context Provider
 * Manages user authentication state and provides auth methods throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIClientError } from '@/lib/api-client';
import type { UserResponse, NDAStatus } from '@/lib/api-types';

interface AuthContextType {
  user: UserResponse | null;
  ndaStatus: NDAStatus | null;
  loading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshNDAStatus: () => Promise<void>;
  isAuthenticated: boolean;
  hasAcceptedNDA: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [ndaStatus, setNdaStatus] = useState<NDAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Load user data from API
   */
  const loadUser = useCallback(async () => {
    try {
      const token = apiClient.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setError(null);

      // Also load NDA status
      try {
        const nda = await apiClient.checkNDAStatus();
        setNdaStatus(nda);
      } catch (ndaError) {
        console.error('Failed to load NDA status:', ndaError);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      
      if (err instanceof APIClientError && err.statusCode === 401) {
        // Token is invalid, clear it
        apiClient.clearToken();
        setUser(null);
        setNdaStatus(null);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Login with token
   */
  const login = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      apiClient.setToken(token);
      
      const userData = await apiClient.getCurrentUser();
      setUser(userData);

      // Load NDA status
      try {
        const nda = await apiClient.checkNDAStatus();
        setNdaStatus(nda);
      } catch (ndaError) {
        console.error('Failed to load NDA status:', ndaError);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      apiClient.clearToken();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    apiClient.clearToken();
    setUser(null);
    setNdaStatus(null);
    setError(null);
    router.push('/login');
  }, [router]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh user');
    }
  }, []);

  /**
   * Refresh NDA status
   */
  const refreshNDAStatus = useCallback(async () => {
    try {
      const nda = await apiClient.checkNDAStatus();
      setNdaStatus(nda);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh NDA status:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh NDA status');
    }
  }, []);

  const value: AuthContextType = {
    user,
    ndaStatus,
    loading,
    error,
    login,
    logout,
    refreshUser,
    refreshNDAStatus,
    isAuthenticated: !!user,
    hasAcceptedNDA: ndaStatus?.accepted ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return auth;
}

/**
 * Hook to require NDA acceptance
 * Redirects to NDA page if not accepted
 */
export function useRequireNDA() {
  const auth = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && auth.isAuthenticated && !auth.hasAcceptedNDA) {
      router.push('/nda');
    }
  }, [auth.loading, auth.isAuthenticated, auth.hasAcceptedNDA, router]);

  return auth;
}
