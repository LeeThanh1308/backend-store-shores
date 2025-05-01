import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ConflictException,
} from '@nestjs/common';
import { StoreItemsService } from './store-items.service';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';

@Controller('store-items')
export class StoreItemsController {
  constructor(private readonly storeItemsService: StoreItemsService) {}

  @Post()
  async create(@Body() createStoreItemDto: CreateStoreItemDto) {
    return await this.storeItemsService.create(createStoreItemDto);
  }

  @Get()
  async findAll(@Query('search') search: string) {
    if (search) return await this.storeItemsService.searchByKeyword(search);
    return await this.storeItemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.storeItemsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStoreItemDto: UpdateStoreItemDto,
  ) {
    return await this.storeItemsService.update(+id, updateStoreItemDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.storeItemsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.storeItemsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
