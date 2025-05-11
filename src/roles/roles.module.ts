import { Accounts } from 'src/accounts/entities/account.entity';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { Roles } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesSeed } from './roles.seed';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Accounts]), JwtModule],
  controllers: [RolesController],
  providers: [RolesService, RolesSeed],
})
export class RolesModule {
  constructor(private readonly rolesSeed: RolesSeed) {
    this.rolesSeed.createDefaultRoles();
  }
}
