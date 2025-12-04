"use client";

import { useEffect } from "react";

/**
 * Component that silently pings the backend health endpoint on mount
 * to wake up the server from Render.com's cold start state.
 * This runs in the background without blocking the UI.
 */
export function BackendWarmup() {
  useEffect(() => {
    const warmupBackend = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dataroom-backend-api.onrender.com';
      
      try {
        // Fire and forget - don't await, just trigger the request
        fetch(`${baseUrl}/health`, { 
          method: 'GET',
          // Short timeout - we just want to trigger the wake-up
          signal: AbortSignal.timeout(5000)
        }).catch(() => {
          // Silently ignore errors - this is just a warmup
        });
        
        console.log('[Warmup] Backend ping sent');
      } catch {
        // Silently ignore - warmup is best-effort
      }
    };

    warmupBackend();
  }, []);

  return null;
}
