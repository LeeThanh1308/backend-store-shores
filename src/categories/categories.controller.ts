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
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly filesServices: FilesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(new UploadImageValidationPipe()) file: Express.Multer.File,
  ) {
    try {
      return await this.categoriesService.create(createCategoryDto, file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('id') id: string,
    @Query('parent') parent: string,
  ) {
    if (search) {
      return await this.categoriesService.searchByKeyword(search);
    } else if (id || parent) {
      return await this.categoriesService.findOne({ id: +id, parent: +parent });
    } else {
      return await this.categoriesService.findAll();
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.categoriesService.update(+id, updateCategoryDto, file);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data?.id) {
      return await this.categoriesService.removeOne(+data?.id);
    } else if (data?.ids) {
      return await this.categoriesService.removeMany(data?.ids);
    }
    if (!data?.id || !data?.ids) {
      throw new BadRequestException('Please provide either id or ids.');
    }
  }
}
