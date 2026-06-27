import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

const apiUrl = typeof window !== 'undefined'
  ? window.location.origin
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    emailOTPClient(),
  ],
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
