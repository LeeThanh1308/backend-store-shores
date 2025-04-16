import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTargetGroupDto } from './dto/create-target-group.dto';
import { UpdateTargetGroupDto } from './dto/update-target-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TargetGroup } from './entities/target-group.entity';
import { In, Like, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike } from 'utils';

@Injectable()
export class TargetGroupsService {
  private readonly nameMessage = 'Đối tượng';
  constructor(
    @InjectRepository(TargetGroup)
    private readonly targetGroupRepository: Repository<TargetGroup>,
  ) {}
  async create(createTargetGroupDto: CreateTargetGroupDto) {
    try {
      const createColor =
        await this.targetGroupRepository.create(createTargetGroupDto);
      const result = await this.targetGroupRepository.save(createColor);

      return {
        ...generateMessage(this.nameMessage, 'created', !!result?.id),
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.targetGroupRepository.find({
      where: [
        {
          name: keywordToLike,
        },
      ],
      take: 10,
    });
  }

  async findAll() {
    return await this.targetGroupRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.targetGroupRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async update(id: number, updateTargetGroupDto: UpdateTargetGroupDto) {
    try {
      const findExists = await this.targetGroupRepository.findOneByOrFail({
        id,
      });
      Object.assign(findExists, updateTargetGroupDto);
      const result = await this.targetGroupRepository.save(findExists);
      return {
        ...generateMessage(this.nameMessage, 'updated', !!result?.id),
        data: result,
      };
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async removeOne(id: number) {
    const findTarget = await this.targetGroupRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findTarget?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.targetGroupRepository.delete({
      id: findTarget?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findTarget = await this.targetGroupRepository.findBy({
        id: In(ids),
      });
      if (!findTarget.length) return;
      const result = await this.targetGroupRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}
