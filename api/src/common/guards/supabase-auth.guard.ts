import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabase;

  constructor(private readonly reflector: Reflector, private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: AuthenticatedUser }>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user?.email) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    request.user = {
      id: data.user.id,
      email: data.user.email,
    };

    return true;
  }
}

function extractBearerToken(header?: string) {
  if (!header) {
    return null;
  }

  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
}
