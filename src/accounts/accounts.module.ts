import { Module, forwardRef } from '@nestjs/common';

import { Accounts } from './entities/account.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AuthModule } from 'src/auth/auth.module';
import { FilesModule } from 'src/files/files.module';
import { JwtModule } from '@nestjs/jwt';
import { Roles } from 'src/roles/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verifications } from 'src/verifications/entities/verification.entity';
import { VerificationsModule } from 'src/verifications/verifications.module';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Accounts, Roles, Verifications]),
    forwardRef(() => VerificationsModule),
    AuthModule,
    JwtModule,
    FilesModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
