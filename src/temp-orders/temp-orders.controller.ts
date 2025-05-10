import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TempOrdersService } from './temp-orders.service';
import { CreateTempOrderDto } from './dto/create-temp-order.dto';
import { UpdateTempOrderDto } from './dto/update-temp-order.dto';

@Controller('temp-orders')
export class TempOrdersController {
  constructor(private readonly tempOrdersService: TempOrdersService) {}

  @Post()
  create(@Body() createTempOrderDto: CreateTempOrderDto) {
    return this.tempOrdersService.create(createTempOrderDto);
  }

  @Get()
  findAll() {
    return this.tempOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tempOrdersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTempOrderDto: UpdateTempOrderDto) {
    return this.tempOrdersService.update(+id, updateTempOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tempOrdersService.remove(+id);
  }
}
