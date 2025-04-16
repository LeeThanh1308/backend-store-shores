import { Module } from '@nestjs/common';
import { ProductBrandsService } from './product-brands.service';
import { ProductBrandsController } from './product-brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBrand } from './entities/product-brand.entity';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBrand]), FilesModule],
  controllers: [ProductBrandsController],
  providers: [ProductBrandsService],
})
export class ProductBrandsModule {}
