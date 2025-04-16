// roles.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from './entities/role.entity';
import { Accounts } from 'src/accounts/entities/account.entity';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class RolesSeed {
  constructor(
    @InjectRepository(Roles)
    private readonly roleRepository: Repository<Roles>,
    @InjectRepository(Accounts)
    private readonly accountRepository: Repository<Accounts>,
  ) {}

  async createDefaultRoles() {
    const existingRoles = await this.roleRepository.find();
    if (existingRoles.length === 0) {
      const defaultRoles = [
        { id: 1, role: 'R1', description: 'CEO', rating: 1 },
        { id: 2, role: 'R2', description: 'MANAGE', rating: 2 },
        { id: 3, role: 'R3', description: 'STAFF', rating: 3 },
      ];
      await this.roleRepository.save(defaultRoles);
      const account = await this.accountRepository.findOne({
        where: {
          roles: {
            role: 'R1',
          },
        },
      });
      if (!account) {
        const password = randomUUID();
        const status = await this.accountRepository.save({
          fullname: 'Admin',
          email: 'le1308308@gmail.com',
          phone: '0865505165',
          password: await bcrypt.hash(password, 10),
          gender: 'x',
          birthday: new Date(),
          usid: '@admin',
          roles: {
            id: 1,
            role: 'R1',
            description: 'CEO',
            rating: 1,
          },
        });
        if (status) Logger.log(`Tạo tài khoản admin thành công bạn hãy đăng nhập với email: le1308308@gmail.com password: ${password}`);
      }
    }
    // const accounts = await this.accountRepository.find();
    // if (!accounts) {
    //   const status = await this.accountRepository.save({
    //     fullname: 'Admin',
    //     email: 'le1308308@gmail.com',
    //     phone: '0865505165',
    //     password: await bcrypt.hash('admin', 10),
    //     gender: 'Male',
    //     birthday: new Date(),
    //     usid: randomUUID(),
    //   });
    //   Logger.log(status);
    // }
  }
}
