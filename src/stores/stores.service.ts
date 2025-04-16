import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { In, Like, Repository } from 'typeorm';
import { convertTextToLike } from 'utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { generateMessage } from 'src/common/messages/index.messages';

@Injectable()
export class StoresService {
  private readonly nameMessage = 'Kho hàng';
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}
  async create(createStoreDto: CreateStoreDto) {
    try {
      const createStore = this.storesRepository.create();
      const result = await this.storesRepository.save(createStore);
      return {
        ...generateMessage(this.nameMessage, 'created', true),
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    return await this.storesRepository.find();
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.storesRepository.find({
      where: [],
      take: 10,
    });
  }

  async findOne(id: number) {
    return await this.storesRepository.findOneBy({ id: id });
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    try {
      const findBrandExists = await this.storesRepository.findOne({
        where: { id },
      });
      if (!findBrandExists)
        throw new NotFoundException(
          `Thương hiệu sản phẩm với ID ${id} không tồn tại`,
        );

      Object.assign(findBrandExists, updateStoreDto);
      const updatedBrand = await this.storesRepository.save(findBrandExists);
      return {
        ...generateMessage(this.nameMessage, 'updated', true),
        data: updatedBrand,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeOne(id: number) {
    const findStore = await this.storesRepository.findOne({
      where: {
        id,
      },
    });
    if (!findStore?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.storesRepository.delete({ id: findStore?.id });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findStore = await this.storesRepository.findBy({ id: In(ids) });
      if (!findStore.length) return { message: 'ID không hợp lệ.' };
      const result = await this.storesRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}
