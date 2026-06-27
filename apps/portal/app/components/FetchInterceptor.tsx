'use client';

import { useEffect } from 'react';

export function FetchInterceptor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = function (input, init) {
        let updatedInput = input;
        
        const localPattern = 'http://localhost:4000';
        const absolutePattern = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-2a04.up.railway.app';
        const targetOrigin = window.location.origin;

        const rewriteUrl = (urlStr: string) => {
          if (urlStr.startsWith(localPattern)) {
            return urlStr.replace(localPattern, targetOrigin);
          }
          if (urlStr.startsWith(absolutePattern)) {
            return urlStr.replace(absolutePattern, targetOrigin);
          }
          return urlStr;
        };

        if (typeof input === 'string') {
          updatedInput = rewriteUrl(input);
        } else if (input instanceof URL) {
          updatedInput = new URL(rewriteUrl(input.href));
        } else if (input && typeof input === 'object' && 'url' in input && typeof (input as any).url === 'string') {
          const newUrl = rewriteUrl((input as any).url);
          updatedInput = new Request(newUrl, input as any);
        }

        // Force credentials: 'include' for all requests going to our origin /api
        let isApiRequest = false;
        const checkUrl = typeof updatedInput === 'string' 
          ? updatedInput 
          : updatedInput instanceof URL 
            ? updatedInput.href 
            : (updatedInput as any)?.url || '';

        if (checkUrl.startsWith(targetOrigin + '/api') || checkUrl.startsWith('/api')) {
          isApiRequest = true;
        }

        if (isApiRequest) {
          init = init || {};
          init.credentials = 'include';
        }
        
        return originalFetch(updatedInput, init);
      };
    }
  }, []);

  return null;
}
