import { Module } from '@nestjs/common';
import { ProductSizesService } from './product-sizes.service';
import { ProductSizesController } from './product-sizes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSize } from './entities/product-size.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSize])],
  controllers: [ProductSizesController],
  providers: [ProductSizesService],
})
export class ProductSizesModule {}
