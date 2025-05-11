import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import {
  DataSource,
  ILike,
  In,
  IsNull,
  LessThan,
  Like,
  MoreThan,
  Repository,
} from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { Accounts } from 'src/accounts/entities/account.entity';
import { Roles } from 'src/roles/entities/role.entity';
import { convertTextToLike } from 'utils';

@Injectable()
export class BranchesService {
  private readonly nameMessage = 'Chi nhánh';
  private accountRepository: Repository<Accounts>;
  private roleRepository: Repository<Roles>;
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly dataSource: DataSource,
  ) {
    this.accountRepository = this.dataSource.getRepository(Accounts);
    this.roleRepository = this.dataSource.getRepository(Roles);
  }
  async create(createBranchDto: CreateBranchDto) {
    try {
      const createBranch = await this.branchRepository.create(createBranchDto);
      const result = await this.branchRepository.save(createBranch);
      return generateMessage(this.nameMessage, 'created', !!result.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    return await this.branchRepository.find();
  }

  async findOne(id: number) {
    return await this.branchRepository.findOne({
      where: {
        id,
      },
    });
  }
  async handleGetEmployeesAccounts(user: any, keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.accountRepository.find({
      where: [
        {
          phone: keywordToLike,
          roles: IsNull(),
        },
        {
          id: keywordToLike,
          roles: IsNull(),
        },
        {
          fullname: keywordToLike,
          roles: IsNull(),
        },
        {
          email: keywordToLike,
          roles: IsNull(),
        },
      ],
    });
  }

  async handleGetThisBranches(user: Partial<Accounts | any>) {
    if (user?.ratings == 1) {
      return await this.branchRepository.find();
    }
    return await this.branchRepository.find({
      where: [
        {
          manage: {
            id: user.id,
          },
        },
        {
          staffs: {
            id: user.id,
          },
        },
      ],
    });
  }

  async handleGetEmployeesBranch(branchId: number) {
    const data = await this.branchRepository.findOne({
      relations: {
        manage: {
          roles: true,
        },
        staffs: {
          roles: true,
        },
      },
      where: {
        id: branchId,
      },
    });
    const dataReturn: any = [];
    if (data?.manage) {
      dataReturn.push(data.manage);
    }
    return [...dataReturn, ...(Array.isArray(data?.staffs) ? data.staffs : [])];
  }

  async handleSetRoleEmployees(
    user: any,
    branchId: number,
    employeeId: string,
    role: string,
  ) {
    try {
      const findAccount = await this.accountRepository.findOne({
        where: {
          id: employeeId,
          manage: { id: IsNull() },
          staff: { id: IsNull() },
        },
      });
      const findBranch = await this.branchRepository.findOne({
        relations: {
          manage: true,
        },
        where: {
          id: branchId,
        },
      });
      const findRole = await this.roleRepository.findOne({
        where: {
          description: role,
          rating: MoreThan(user?.rating),
        },
      });
      console.log(findAccount, findBranch, findRole);
      if (!findAccount || !findBranch || !findRole) {
        throw new NotFoundException();
      }

      if (findRole?.description == 'MANAGE') {
        if (findBranch.manage) {
          await this.accountRepository
            .createQueryBuilder()
            .update()
            .set({ roles: null }) // hoặc staff: null
            .where('id = :id', { id: findBranch.manage.id })
            .execute();
        }
        await this.accountRepository.save({
          ...findAccount,
          manage: findBranch,
          roles: findRole,
          staff: null,
        });
      } else if (findRole?.description == 'STAFF') {
        await this.accountRepository.save({
          ...findAccount,
          staff: findBranch,
          roles: findRole,
        });
      }
      return generateMessage(this.nameMessage, 'updated', true);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async handleDeleteRoleEmployees(user: any, employeeId: string) {
    try {
      const findAccount = await this.accountRepository.findOne({
        relations: { roles: true },
        where: {
          id: employeeId,
          roles: {
            rating: MoreThan(user?.rating),
          },
        },
      });
      if (findAccount) {
        await this.branchRepository.update(
          {
            manage: {
              id: findAccount.id,
            },
          },
          {
            manage: null,
          },
        );
        await this.accountRepository
          .createQueryBuilder()
          .update()
          .set({ roles: null, staff: null }) // hoặc staff: null
          .where('id = :id', { id: employeeId })
          .execute();
        return generateMessage('Quyền tài khoản', 'deleted', true);
      } else {
        return generateMessage('Quyền tài khoản', 'deleted', false);
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateBranchDto: UpdateBranchDto) {
    try {
      const findBranchExists = await this.branchRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!findBranchExists?.id) {
        throw new NotFoundException(`Branch with ID ${id} not found`);
      }

      Object.assign(findBranchExists, updateBranchDto);
      await this.branchRepository.save(findBranchExists);
      return generateMessage(this.nameMessage, 'updated', true);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeOne(id: number) {
    const findCate = await this.branchRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findCate?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.branchRepository.delete({ id: findCate?.id });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findCate = await this.branchRepository.findBy({ id: In(ids) });
      if (!findCate.length) {
        throw new NotFoundException(`Branch with ID not found`);
      }
      const result = await this.branchRepository.remove(findCate);
      return generateMessage(this.nameMessage, 'deleted', !!result);
    } catch (error) {
      throw new Error(error);
    }
  }

  async handleCountTotalBranches() {
    return await this.branchRepository.count();
  }
}
