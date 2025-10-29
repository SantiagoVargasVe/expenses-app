import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth.types';

export const ActiveUser = createParamDecorator<
  keyof AuthenticatedUser | undefined
>((data: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
  const request = context
    .switchToHttp()
    .getRequest<{ user: AuthenticatedUser | undefined }>();

  const user = request.user;

  if (!data) {
    return user;
  }

  return user?.[data];
});
