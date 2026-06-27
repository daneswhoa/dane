'use client';

import { useEffect } from 'react';

export function FetchInterceptor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = function (input, init) {
        let updatedInput = input;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-2a04.up.railway.app';
        
        // Define base search pattern
        const searchPattern = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        
        if (typeof input === 'string' && input.startsWith(searchPattern)) {
          updatedInput = input.replace(searchPattern, apiUrl);
        } else if (input instanceof URL && input.href.startsWith(searchPattern)) {
          updatedInput = new URL(input.href.replace(searchPattern, apiUrl));
        } else if (input && typeof input === 'object' && 'url' in input && typeof (input as any).url === 'string' && (input as any).url.startsWith(searchPattern)) {
          const newUrl = (input as any).url.replace(searchPattern, apiUrl);
          updatedInput = new Request(newUrl, input as any);
        }

        // Check if this request goes to our API
        let isApiRequest = false;
        if (typeof updatedInput === 'string' && updatedInput.startsWith(apiUrl)) {
          isApiRequest = true;
        } else if (updatedInput instanceof URL && updatedInput.href.startsWith(apiUrl)) {
          isApiRequest = true;
        } else if (updatedInput && typeof updatedInput === 'object' && 'url' in updatedInput && typeof (updatedInput as any).url === 'string' && (updatedInput as any).url.startsWith(apiUrl)) {
          isApiRequest = true;
        }

        // If it is a request to the NestJS API, force credentials: 'include'
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
