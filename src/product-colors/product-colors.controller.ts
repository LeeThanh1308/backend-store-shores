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
import { ProductColorsService } from './product-colors.service';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';

@Controller('product-colors')
export class ProductColorsController {
  constructor(private readonly productColorsService: ProductColorsService) {}

  @Post()
  async create(@Body() createProductColorDto: CreateProductColorDto) {
    return await this.productColorsService.create(createProductColorDto);
  }

  @Get()
  async findAll(@Query('search') search: string) {
    if (search) return await this.productColorsService.searchByKeyword(search);
    return await this.productColorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productColorsService.findOne(+id);
  }

  @Get('products/:productID')
  async onFindColorByProductID(
    @Param('productID') productID: string,
    @Query('search') search: string,
  ) {
    return await this.productColorsService.handleFindColorByProductID(
      search,
      +productID,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductColorDto: UpdateProductColorDto,
  ) {
    return await this.productColorsService.update(+id, updateProductColorDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.productColorsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.productColorsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
