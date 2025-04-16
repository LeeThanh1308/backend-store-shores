import { Module } from '@nestjs/common';
import { StoreItemsService } from './store-items.service';
import { StoreItemsController } from './store-items.controller';

@Module({
  controllers: [StoreItemsController],
  providers: [StoreItemsService],
})
export class StoreItemsModule {}
