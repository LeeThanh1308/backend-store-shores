import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoreItemsService } from './store-items.service';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';

@Controller('store-items')
export class StoreItemsController {
  constructor(private readonly storeItemsService: StoreItemsService) {}

  @Post()
  create(@Body() createStoreItemDto: CreateStoreItemDto) {
    return this.storeItemsService.create(createStoreItemDto);
  }

  @Get()
  findAll() {
    return this.storeItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreItemDto: UpdateStoreItemDto) {
    return this.storeItemsService.update(+id, updateStoreItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeItemsService.remove(+id);
  }
}
