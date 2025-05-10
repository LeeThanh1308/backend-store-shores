import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  Query,
} from '@nestjs/common';
import { ProductSizesService } from './product-sizes.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';

@Controller('product-sizes')
export class ProductSizesController {
  constructor(private readonly productSizesService: ProductSizesService) {}

  @Post()
  async create(@Body() createProductSizeDto: CreateProductSizeDto) {
    return await this.productSizesService.create(createProductSizeDto);
  }

  @Get()
  async findAll(@Query('search') search: string) {
    if (search) return await this.productSizesService.searchByKeyword(search);
    return await this.productSizesService.findAll();
  }

  @Get('products/:id')
  async findSizesAndProduct(
    @Query('search') search: string,
    @Param('id') id: string,
  ) {
    if (id && !search) {
      return await this.productSizesService.findSizesWhereProductID(+id);
    }
    return await this.productSizesService.findSizesAndProduct(search, +id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductSizeDto: UpdateProductSizeDto,
  ) {
    return await this.productSizesService.update(+id, updateProductSizeDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.productSizesService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.productSizesService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
