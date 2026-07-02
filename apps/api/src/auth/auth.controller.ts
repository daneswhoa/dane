import { Controller, All, Req, Res, Post, Body, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth, db } from './better-auth';
import { eq, and, gt } from 'drizzle-orm';
import * as schema from '../db/schema';

@Controller('auth')
export class AuthController {
  @Post('check-invitation')
  async checkInvitation(@Body() body: { email: string }) {
    if (!body.email) {
      return { invited: false };
    }
    try {
      const activeInvite = await db
        .select()
        .from(schema.invitations)
        .where(
          and(
            eq(schema.invitations.email, body.email.toLowerCase().trim()),
            eq(schema.invitations.used, false),
            gt(schema.invitations.expiresAt, new Date())
          )
        )
        .limit(1);

      if (activeInvite.length === 0) {
        return { invited: false };
      }

      const invite = activeInvite[0];
      
      // Resolve property/org details
      let propertyName = 'Dane Properties';
      let managerName = 'Sophia AI Management';
      
      if (invite.targetRole === 'tenant') {
        const prop = await db.select().from(schema.properties).where(eq(schema.properties.id, invite.propertyId || '')).limit(1);
        const owner = await db.select().from(schema.users).where(eq(schema.users.id, invite.ownerId)).limit(1);
        if (prop.length > 0) propertyName = prop[0].name;
        if (owner.length > 0) managerName = owner[0].name;
      } else {
        const owner = await db.select().from(schema.users).where(eq(schema.users.id, invite.ownerId)).limit(1);
        if (owner.length > 0) {
          propertyName = owner[0].organizationName || 'Dane Properties';
          managerName = owner[0].name;
        }
      }

      return {
        invited: true,
        code: invite.id,
        targetRole: invite.targetRole,
        propertyName,
        managerName,
      };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Failed to check invitation: ${err.message || 'Database error'}`
      );
    }
  }

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

  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    const cookieHeader = req.headers.cookie || '';
    
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
  }
}
