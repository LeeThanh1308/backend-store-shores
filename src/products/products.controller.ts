import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
  ConflictException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadImagesRequiredValidationPipe } from 'src/common/validators/upload-images-required.validator';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';
import { UploadImagesValidationPipe } from 'src/common/validators/upload-images.validator';
import { FiltersProductDto } from './dto/filters-product.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RequestWithUser } from 'src/common/types/request-with-user';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(new UploadImagesRequiredValidationPipe())
    files: Express.Multer.File[],
  ) {
    return await this.productsService.create(createProductDto, files);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('id') id: string,
    @Query('slug') slug: string,
  ) {
    if (search) {
      return await this.productsService.searchByKeyword(search);
    }
    if (slug) {
      return await this.productsService.findProductBySlug(slug);
    }
    if (id) {
      return await this.productsService.findOne(+id);
    }
    return await this.productsService.findAll();
  }

  @Post('search')
  async searchFilter(@Body() filtersProductDto: FiltersProductDto) {
    return await this.productsService.searchFilter(filtersProductDto);
  }

  @Get('cashiers')
  @UseGuards(AuthGuard)
  async onSearchProductByCashiers(
    @Req() req: RequestWithUser,
    @Query('search') search: string,
  ) {
    const user = req.user;
    return await this.productsService.handleSearchProductByCashiers(
      search,
      user,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productsService.findOne(+id);
  // }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(new UploadImagesValidationPipe())
    files: Express.Multer.File[],
  ) {
    return await this.productsService.update(+id, updateProductDto, files);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.productsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.productsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }

  @Get('trendings')
  async onGetTrendings(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.productsService.handleGetTrendings(page, limit);
  }

  @Get('brands')
  async onGetProductBrands() {
    return await this.productsService.handleGetProductBrands();
  }

  @Get('count')
  async onCountTotalProducts() {
    return await this.productsService.handleCountTotalProducts();
  }
}
