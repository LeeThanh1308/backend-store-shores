import { Module } from '@nestjs/common';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemsController } from './store-items.controller';
import { StoreItemsService } from './store-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StoreItem])],
  controllers: [StoreItemsController],
  providers: [StoreItemsService],
})
export class StoreItemsModule {}
