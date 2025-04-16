import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  ConflictException,
} from '@nestjs/common';
import { ProductBrandsService } from './product-brands.service';
import { CreateProductBrandDto } from './dto/create-product-brand.dto';
import { UpdateProductBrandDto } from './dto/update-product-brand.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';

@Controller('product-brands')
export class ProductBrandsController {
  constructor(private readonly productBrandsService: ProductBrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createProductBrandDto: CreateProductBrandDto,
    @UploadedFile(new UploadImageValidationPipe()) file: Express.Multer.File,
  ) {
    console.log(file);
    return await this.productBrandsService.create(createProductBrandDto, file);
  }

  @Get()
  async findAll(@Query('search') search: string) {
    if (search) {
      return await this.productBrandsService.searchByKeyword(search);
    }
    return await this.productBrandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productBrandsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateProductBrandDto: UpdateProductBrandDto,
    @UploadedFile(new UploadImageValidationPipe()) file: Express.Multer.File,
  ) {
    return await this.productBrandsService.update(
      +id,
      updateProductBrandDto,
      file,
    );
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.productBrandsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.productBrandsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
