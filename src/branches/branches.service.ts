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
import { In, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';

@Injectable()
export class BranchesService {
  private readonly nameMessage = 'Chi nhánh';
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}
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
