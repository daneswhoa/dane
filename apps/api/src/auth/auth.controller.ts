import { Controller, All, Req, Res, Post, Body, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth, db } from './better-auth';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';

@Controller('auth')
export class AuthController {
  @Post('update-onboarding')
  async updateOnboarding(
    @Body() body: { email: string; role: string; organizationName?: string }
  ) {
    if (!body.email || !body.role) {
      throw new BadRequestException('Email and role are required parameters.');
    }
    try {
      await db
        .update(schema.users)
        .set({
          role: body.role,
          organizationName: body.organizationName || null,
        })
        .where(eq(schema.users.email, body.email));

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Failed to update onboarding state: ${err.message || 'Database connection timeout'}`
      );
    }
  }

  @Post('check-email')
  async checkEmail(@Body() body: { email: string }) {
    if (!body.email) {
      return { exists: false };
    }
    try {
      const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, body.email.toLowerCase().trim()))
        .limit(1);

      return { exists: existing.length > 0 };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Database connection error: ${err.message || 'Timeout connecting to PostgreSQL'}`
      );
    }
  }

  @All('debug-headers')
  async debugHeaders(@Req() req: Request) {
    return {
      headers: req.headers,
      env: {
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET',
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'NOT SET',
        CORS_ORIGINS: process.env.CORS_ORIGINS || 'NOT SET',
      }
    };
  }

  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    console.log(`[Better Auth Request] ${req.method} ${req.url}`);
    const cookieHeader = req.headers.cookie || '';
    console.log(`[Better Auth Incoming Cookies] ${cookieHeader || '(None)'}`);
    
    // Self-healing mechanism for duplicate cookies (host-only vs wildcard)
    const sessionTokenKeys = ['__Secure-better-auth.session_token', 'better-auth.session_token'];
    let duplicateDetected = false;
    for (const key of sessionTokenKeys) {
      const tokens = cookieHeader.split(';').filter(c => c.trim().startsWith(`${key}=`));
      if (tokens.length > 1) {
        duplicateDetected = true;
        break;
      }
    }

    if (duplicateDetected) {
      console.warn(`[Better Auth Conflict] Detected duplicate session_token cookies. Auto-clearing all variants to recover...`);
      const cleanCookieDomain = process.env.COOKIE_DOMAIN 
        ? process.env.COOKIE_DOMAIN.replace(/^['"]|['"]$/g, '').trim() 
        : '';
        
      const clearHeaders = [
        // Clear host-only non-secure
        `better-auth.session_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`,
        `better-auth.session_data=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`,
        // Clear host-only secure
        `__Secure-better-auth.session_token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`,
        `__Secure-better-auth.session_data=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`,
      ];
      
      if (cleanCookieDomain) {
        clearHeaders.push(
          // Clear wildcard non-secure
          `better-auth.session_token=; Max-Age=0; Domain=${cleanCookieDomain}; Path=/; HttpOnly; SameSite=Lax`,
          `better-auth.session_data=; Max-Age=0; Domain=${cleanCookieDomain}; Path=/; HttpOnly; SameSite=Lax`,
          // Clear wildcard secure
          `__Secure-better-auth.session_token=; Max-Age=0; Domain=${cleanCookieDomain}; Path=/; HttpOnly; Secure; SameSite=None`,
          `__Secure-better-auth.session_data=; Max-Age=0; Domain=${cleanCookieDomain}; Path=/; HttpOnly; Secure; SameSite=None`
        );
      }
      
      res.setHeader('Set-Cookie', clearHeaders);
      res.status(401).json({ error: 'Session conflict detected. Cookies cleared. Please sign in again.' });
      return;
    }
    
    await toNodeHandler(auth)(req, res);
    
    console.log(`[Better Auth Response Status] ${res.statusCode}`);
    console.log(`[Better Auth Response Set-Cookie] ${JSON.stringify(res.getHeader('set-cookie') || '(None)')}`);
  }
}
