import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async createATRFToken(
    id: string,
    expRT?: number,
  ): Promise<{ AT: string; RT: string; expAt: number }> {
    const udid = await crypto.randomUUID();
    console.log(udid, id);
    const refreshToken = await this.jwtService.signAsync(
      { id, udid },
      { expiresIn: expRT ? expRT + 's' : process.env.JWT_RT_EXP_SECOND + 's' },
    );
    const accessToken = await this.jwtService.signAsync(
      { id, udid },
      { expiresIn: process.env.JWT_AT_EXP_SECOND + 's' },
    );
    console.log(refreshToken, accessToken);
    if (!refreshToken && !accessToken) {
      throw new Error();
    }
    return {
      AT: accessToken,
      RT: refreshToken,
      expAt: Number(process.env.JWT_AT_EXP_SECOND),
    };
  }

  async handleVerifyToken(token: string) {
    const result = await this.jwtService.verifyAsync(token);
    return result;
  }

  async handleCreateToken(token: string) {
    return this.jwtService.signAsync(token);
  }
}
