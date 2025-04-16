import { Module } from '@nestjs/common';
import { ProductColorsService } from './product-colors.service';
import { ProductColorsController } from './product-colors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductColor } from './entities/product-color.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductColor])],
  controllers: [ProductColorsController],
  providers: [ProductColorsService],
})
export class ProductColorsModule {}
