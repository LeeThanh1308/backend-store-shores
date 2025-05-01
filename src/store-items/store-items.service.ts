import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreItem } from './entities/store-item.entity';
import { In, Like, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike, convertTextToLikeVi } from 'utils';

@Injectable()
export class StoreItemsService {
  private readonly nameMessage = 'Store items';
  constructor(
    @InjectRepository(StoreItem)
    private readonly storeItemsRepository: Repository<StoreItem>,
  ) {}
  async create(createStoreItemDto: CreateStoreItemDto) {
    try {
      const createColor =
        await this.storeItemsRepository.create(createStoreItemDto);
      const result = await this.storeItemsRepository.save(createColor);

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
    return await this.storeItemsRepository.find({
      where: [],
      take: 10,
    });
  }

  async findAll() {
    return await this.storeItemsRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.storeItemsRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async update(id: number, updateStoreItemDto: UpdateStoreItemDto) {
    try {
      const findExists = await this.storeItemsRepository.findOneByOrFail({
        id,
      });
      Object.assign(findExists, updateStoreItemDto);
      const result = await this.storeItemsRepository.save(findExists);
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
    const findBrand = await this.storeItemsRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.storeItemsRepository.delete({
      id: findBrand?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findBrand = await this.storeItemsRepository.findBy({
        id: In(ids),
      });
      if (!findBrand.length) return;
      const result = await this.storeItemsRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}
