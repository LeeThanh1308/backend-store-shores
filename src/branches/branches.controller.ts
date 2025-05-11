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
  UseGuards,
  Req,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';
import { RequestWithUser } from 'src/common/types/request-with-user';

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

  @Get('this-branches')
  @UseGuards(AuthGuard)
  async onGetThisBranches(@Req() req: RequestWithUser) {
    const user = req.user;
    return await this.branchesService.handleGetThisBranches(user);
  }
  @Get(':branchId/employees')
  async onGetEmployeesBranch(@Param('branchId') branchId: string) {
    return await this.branchesService.handleGetEmployeesBranch(
      Number(branchId),
    );
  }

  @Patch(':branchId/employees/:employeeId/:role')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onSetRoleEmployees(
    @Req() req: RequestWithUser,
    @Param('branchId') branchId: string,
    @Param('employeeId') employeeId: string,
    @Param('role') role: string,
  ) {
    const user = req.user;

    return await this.branchesService.handleSetRoleEmployees(
      user,
      Number(branchId),
      employeeId,
      role,
    );
  }

  @Delete('employees/:employeeId')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onDeleteRoleEmployees(
    @Req() req: RequestWithUser,
    @Param('employeeId') employeeId: string,
  ) {
    const user = req.user;
    return await this.branchesService.handleDeleteRoleEmployees(
      user,
      employeeId,
    );
  }

  @Get('accounts')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onGetEmployeesAccounts(
    @Req() req: RequestWithUser,
    @Query('search') search: string,
  ) {
    const user = req.user;
    return await this.branchesService.handleGetEmployeesAccounts(user, search);
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
  @Get('count')
  async onCountTotalBranches() {
    return await this.branchesService.handleCountTotalBranches();
  }
}
