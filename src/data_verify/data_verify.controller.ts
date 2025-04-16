import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DataVerifyService } from './data_verify.service';
import { CreateDataVerifyDto } from './dto/create-data_verify.dto';
import { UpdateDataVerifyDto } from './dto/update-data_verify.dto';

@Controller('data-verify')
export class DataVerifyController {
  constructor(private readonly dataVerifyService: DataVerifyService) {}

  @Post()
  create(@Body() createDataVerifyDto: CreateDataVerifyDto) {
    return this.dataVerifyService.create(createDataVerifyDto);
  }

  @Get()
  findAll() {
    return this.dataVerifyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataVerifyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDataVerifyDto: UpdateDataVerifyDto) {
    return this.dataVerifyService.update(+id, updateDataVerifyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataVerifyService.remove(+id);
  }
}
