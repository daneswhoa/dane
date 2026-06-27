'use client';

import { useEffect } from 'react';

export function FetchInterceptor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = function (input, init) {
        let updatedInput = input;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://landlord-api-1016907064838.europe-west4.run.app';
        
        if (typeof input === 'string' && input.startsWith(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`)) {
          updatedInput = input.replace(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`, apiUrl);
        } else if (input instanceof URL && input.href.startsWith(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`)) {
          updatedInput = new URL(input.href.replace(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`, apiUrl));
        } else if (input && typeof input === 'object' && 'url' in input && typeof (input as any).url === 'string' && (input as any).url.startsWith(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`)) {
          // If input is a Request object, we reconstruct it with the updated URL
          const newUrl = (input as any).url.replace(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`, apiUrl);
          updatedInput = new Request(newUrl, input as any);
        }
        
        return originalFetch(updatedInput, init);
      };
    }
  }, []);

  return null;
}
