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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageRequiredValidationPipe } from 'src/common/validators/upload-image-required.validator';

@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createSliderDto: CreateSliderDto,
    @UploadedFile(new UploadImageRequiredValidationPipe())
    file: Express.Multer.File,
  ) {
    return await this.slidersService.create(createSliderDto, file);
  }

  @Get()
  async findAll(@Query('search') search: string) {
    if (search) {
      return await this.slidersService.searchByKeyword(search);
    }
    return await this.slidersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.slidersService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateSliderDto,
    @UploadedFile(new UploadImageRequiredValidationPipe())
    file: Express.Multer.File,
  ) {
    return await this.slidersService.update(+id, updateCategoryDto, file);
  }

  @Delete('')
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.slidersService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.slidersService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
