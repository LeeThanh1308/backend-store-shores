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
import { TargetGroupsService } from './target-groups.service';
import { CreateTargetGroupDto } from './dto/create-target-group.dto';
import { UpdateTargetGroupDto } from './dto/update-target-group.dto';

@Controller('target-groups')
export class TargetGroupsController {
  constructor(private readonly targetGroupsService: TargetGroupsService) {}

  @Post()
  async create(@Body() createTargetGroupDto: CreateTargetGroupDto) {
    return await this.targetGroupsService.create(createTargetGroupDto);
  }

  @Get()
  async findAll(@Query('search') search: string) {
    if (search) {
      return await this.targetGroupsService.searchByKeyword(search);
    }
    return await this.targetGroupsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.targetGroupsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTargetGroupDto: UpdateTargetGroupDto,
  ) {
    return await this.targetGroupsService.update(+id, updateTargetGroupDto);
  }

  @Delete('')
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data.id) {
      return await this.targetGroupsService.removeOne(+data.id);
    }
    if (data.ids) {
      return await this.targetGroupsService.removeMany(data.ids);
    }
    throw new ConflictException('Please provide either id or ids.');
  }
}
