import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRole = this.reflector.getAllAndOverride('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    const result = request?.user?.role
      .map((role: string) => requiredRole.includes(role))
      .find((val: boolean) => val === true);

    if (result) {
      return true;
    }
    throw new UnauthorizedException('Not Authorized');
  }
}
