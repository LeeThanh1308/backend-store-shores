import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesSeed } from './roles.seed';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './entities/role.entity';
import { Accounts } from 'src/accounts/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Accounts])],
  controllers: [RolesController],
  providers: [RolesService, RolesSeed],
})
export class RolesModule {
  constructor(private readonly rolesSeed: RolesSeed) {
    this.rolesSeed.createDefaultRoles();
  }
}
