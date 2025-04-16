import { Module, forwardRef } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verifications } from './entities/verification.entity';
import { AccountsModule } from 'src/accounts/accounts.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TypeOrmModule.forFeature([Verifications]), forwardRef(() => AccountsModule), ScheduleModule.forRoot()],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
