import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ConflictException,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';
import { Request } from 'express';
import { RequestWithUser } from 'src/common/types/request-with-user';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async create(
    @Req() req: RequestWithUser,
    @Body() createStoreDto: CreateStoreDto,
  ) {
    return await this.storesService.create(createStoreDto, req.user);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('branchID') branchID: string,
  ) {
    if (search) {
      return await this.storesService.searchByKeyword(search);
    }
    if (branchID) {
      return await this.storesService.handleFindBranchID(+branchID);
    }
    return await this.storesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return await this.storesService.update(+id, updateStoreDto);
  }

  @Delete()
  async remove(@Body() data: { id: string; ids: number[] }) {
    if (data?.id) {
      return await this.storesService.removeOne(+data.id);
    }
    if (data?.ids) {
      return await this.storesService.removeMany(data.ids);
    }
    throw new NotFoundException('Please provide either id or ids.');
  }
}
