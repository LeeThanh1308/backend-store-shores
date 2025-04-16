import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    return await this.branchesService.create(createBranchDto);
  }

  @Get()
  async findAll(@Query('id') id: string) {
    if (+id) {
      return await this.branchesService.findOne(+id);
    }
    return await this.branchesService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return await this.branchesService.update(+id, updateBranchDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data?.id) {
      return await this.branchesService.removeOne(+data.id);
    } else if (data?.ids?.length > 0) {
      return await this.branchesService.removeMany(data.ids);
    }
    if (!data?.id || !data?.ids) {
      throw new BadRequestException('Please provide either id or ids.');
    }
  }
}
