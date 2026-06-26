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

  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(auth)(req, res);
  }
}
