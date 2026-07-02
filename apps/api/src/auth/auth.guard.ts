import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { auth } from './better-auth';

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url || '';
    if (url.includes('invites/verify')) {
      return true;
    }

    try {
      // Build Headers object from request headers for Better Auth compatibility
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => headers.append(key, v));
          } else {
            headers.set(key, value as string);
          }
        }
      }

      const session = await auth.api.getSession({ headers });

      if (!session) {
        throw new UnauthorizedException('Authentication session not found or expired.');
      }

      // Attach the verified user and session metadata to the request
      request.user = session.user;
      request.session = session.session;
      return true;
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Unauthorized');
    }
  }
}
