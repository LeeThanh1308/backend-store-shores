import { Module, forwardRef } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accounts } from './entities/account.entity';
import { VerificationsModule } from 'src/verifications/verifications.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { Roles } from 'src/roles/entities/role.entity';
import { Verifications } from 'src/verifications/entities/verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Accounts, Roles, Verifications]),
    forwardRef(() => VerificationsModule),
    MulterModule.register({
      storage: diskStorage({
        destination: './public/avatars',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const newname = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
          cb(null, `${newname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedFiles = ['.jpg', '.png', '.jpeg'];
        if (!allowedFiles.includes(ext)) {
          req.fileValidator = 'Image is not a valid.';
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['Content-Length']);
          if (fileSize > 1024 * 1024 * 2) {
            req.fileValidator = 'Kích thước file tối da 2mb';
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
    AuthModule,
    JwtModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
