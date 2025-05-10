import { Module } from '@nestjs/common';
import { TempOrdersService } from './temp-orders.service';
import { TempOrdersController } from './temp-orders.controller';

@Module({
  controllers: [TempOrdersController],
  providers: [TempOrdersService],
})
export class TempOrdersModule {}
