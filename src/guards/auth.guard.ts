import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRoles } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accountsRepository: Repository<Accounts>;
  constructor(
    private readonly dataSource: DataSource,
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {
    this.accountsRepository = this.dataSource.getRepository(Accounts);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleApi = this.reflector.get(UserRoles, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    try {
      const accessToken = await this.jwtService.verifyAsync(token ?? '', {
        secret: process.env.JWT_SECRET,
      });
      const account = await this.accountsRepository.findOne({
        relations: { roles: true },
        where: {
          id: accessToken.id,
          refresh_token: accessToken.refresh_token,
          ban: false,
        },
        select: {
          id: true,
          refresh_token: true,
          avatar: true,
          fullname: true,
          gender: true,
          phone: true,
          birthday: true,
          email: true,
          usid: true,
          roles: { role: true, description: true, rating: true },
        },
      });
      if (!account) {
        throw new ForbiddenException();
      }
      const refreshToken = await this.jwtService.verifyAsync(
        account?.refresh_token ?? '',
        { secret: process.env.JWT_SECRET },
      );
      if (
        accessToken.id === refreshToken.id &&
        accessToken.udid === refreshToken.udid
      ) {
        const {
          id,
          avatar,
          fullname,
          roles,
          gender,
          phone,
          birthday,
          email,
          usid,
        } = account;
        if (!roleApi || roleApi.includes(roles?.role)) {
          request['user'] = {
            id,
            fullname,
            avatar: avatar ? avatar : 'avatar.jpg',
            avatarOrigin: avatar,
            gender,
            phone,
            birthday,
            email,
            usid,
            roles: roles?.role,
            description: roles?.description,
            rating: roles?.rating,
          };
          return true;
        } else {
          throw new ForbiddenException();
        }
      }

      throw new ForbiddenException();
    } catch (e) {
      throw new HttpException(
        (e?.errMgs ? e.errMgs : 'Có lỗi sảy ra xin vui lòng thử lại sau.') ||
          new UnauthorizedException(),
        e.status || 401,
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
