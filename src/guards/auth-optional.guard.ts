import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Accounts } from 'src/accounts/entities/account.entity';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthOptionalGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) return true; // ✅ Không có token cũng cho phép truy cập

    try {
      const accessToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const accountRepo = this.dataSource.getRepository(Accounts);
      const account = await accountRepo.findOne({
        relations: { roles: true },
        where: {
          id: accessToken.id,
          refresh_token: accessToken.refresh_token,
          ban: false,
        },
      });

      if (account) {
        request['user'] = {
          id: account.id,
          fullname: account.fullname,
          email: account.email,
          roles: account.roles?.role,
        };
      }
    } catch (err) {
      // Không làm gì nếu lỗi → tiếp tục request bình thường
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
