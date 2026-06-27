import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../../.env') });

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { URL } from 'url';
import * as schema from '../db/schema';

// Create a single database pool for Better Auth with Cloud SQL SSL configuration
const dbUrl = new URL(process.env.DATABASE_URL!);
const pool = new Pool({
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '5432'),
  database: dbUrl.pathname.slice(1),
  ssl: {
    rejectUnauthorized: false,
  },
});
export const db = drizzle(pool, { schema });

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not defined in the environment variables.');
    return;
  }

  // Use the user's domain in production, or fallback for verification
  const fromEmail = 'landlord.hu <no-reply@mylandlordservices.com>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to send email via Resend:', errText);
    } else {
      console.log(`Successfully sent email to ${to} with subject "${subject}"`);
    }
  } catch (error) {
    console.error('Error sending email via Resend:', error);
  }
}

// Helper to clean environment variables (removes quotes and trims)
const getCleanEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) return '';
  return value.replace(/^["']|["']$/g, '').trim();
};

const cleanCookieDomain = getCleanEnv('COOKIE_DOMAIN');
const cleanNodeEnv = getCleanEnv('NODE_ENV');
const isProduction = cleanNodeEnv === 'production';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1a202c; margin-bottom: 16px;">Verify your email</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              Thank you for joining landlord.hu. Please enter the following 6-digit verification code to complete your registration:
            </p>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center; color: #0f172a; background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #718096; font-size: 14px; margin-top: 24px;">
              This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.
            </p>
          </div>
        `;
        await sendEmail({ to: email, subject: `${otp} is your verification code`, html });
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1a202c; margin-bottom: 16px;">Reset your password</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Hi ${user.name},<br/><br/>
            We received a request to reset your password. Click the button below to choose a new password:
          </p>
          <a href="${url}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p style="color: #718096; font-size: 14px; margin-top: 24px;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `;
      await sendEmail({ to: user.email, subject: 'Reset your password', html });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'tenant',
      },
      organizationName: {
        type: 'string',
        required: false,
      },
      username: {
        type: 'string',
        required: false,
      },
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    process.env.NEXT_PUBLIC_APP_URL!,
    process.env.NEXT_PUBLIC_PORTAL_URL!,
  ].filter(Boolean),
  advanced: {
    // Force secure cookies in production, relax in dev
    useSecureCookies: isProduction || !!cleanCookieDomain,
    // Enable cross-subdomain sharing using the shared parent domain
    crossSubDomainCookies: {
      enabled: !!cleanCookieDomain,
      domain: cleanCookieDomain || undefined,
    },
    defaultCookieAttributes: {
      sameSite: (isProduction || !!cleanCookieDomain) ? 'none' : 'lax',
      secure: isProduction || !!cleanCookieDomain,
    }
  },
});
export type Auth = typeof auth;
