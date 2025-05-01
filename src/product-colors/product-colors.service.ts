import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductColor } from './entities/product-color.entity';
import { In, Like, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike, convertTextToLikeVi } from 'utils';

@Injectable()
export class ProductColorsService {
  private readonly nameMessage = 'Màu sản phẩm';
  constructor(
    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,
  ) {}
  async create(createProductColorDto: CreateProductColorDto) {
    try {
      const createColor = await this.productColorRepository.create(
        createProductColorDto,
      );
      const result = await this.productColorRepository.save(createColor);

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
    return await this.productColorRepository.find({
      where: [
        {
          name: Like(convertTextToLikeVi(keyword)),
        },
        {
          name: keywordToLike,
        },

        {
          hexCode: keywordToLike,
        },
      ],
      select: ['id', 'hexCode', 'name'],
      take: 10,
    });
  }

  async findAll() {
    return await this.productColorRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.productColorRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async update(id: number, updateProductColorDto: UpdateProductColorDto) {
    try {
      const findExists = await this.productColorRepository.findOneByOrFail({
        id,
      });
      Object.assign(findExists, updateProductColorDto);
      const result = await this.productColorRepository.save(findExists);
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
    const findBrand = await this.productColorRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.productColorRepository.delete({
      id: findBrand?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findBrand = await this.productColorRepository.findBy({
        id: In(ids),
      });
      if (!findBrand.length) return;
      const result = await this.productColorRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }

  async handleFindColorByProductID(keyword: string, productID: number) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.productColorRepository.find({
      where: [
        {
          name: Like(convertTextToLikeVi(keyword)),
          products: {
            id: productID,
          },
        },
        {
          name: keywordToLike,
          products: {
            id: productID,
          },
        },

        {
          hexCode: keywordToLike,
          products: {
            id: productID,
          },
        },
      ],
    });
  }
}
