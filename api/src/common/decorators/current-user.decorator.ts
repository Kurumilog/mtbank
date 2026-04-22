import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser => {
  const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();

  if (!request.user) {
    throw new Error('Authenticated user is not available in request');
  }

  return request.user;
});
