import { Module } from '@nestjs/common';
import { DataVerifyService } from './data_verify.service';
import { DataVerifyController } from './data_verify.controller';

@Module({
  controllers: [DataVerifyController],
  providers: [DataVerifyService],
})
export class DataVerifyModule {}
