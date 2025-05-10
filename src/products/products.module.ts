import { CartsModule } from 'src/carts/carts.module';
import { FilesModule } from 'src/files/files.module';
import { Module } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), FilesModule, CartsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
