import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSize } from './entities/product-size.entity';
import { In, Like, Repository } from 'typeorm';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike, convertTextToLikeVi } from 'utils';

@Injectable()
export class ProductSizesService {
  private readonly nameMessage = 'Loại sản phẩm';
  constructor(
    @InjectRepository(ProductSize)
    private readonly productSizeRepository: Repository<ProductSize>,
  ) {}
  async create(createProductSizeDto: CreateProductSizeDto) {
    try {
      const createColor =
        await this.productSizeRepository.create(createProductSizeDto);
      const result = await this.productSizeRepository.save(createColor);

      return {
        ...generateMessage(this.nameMessage, 'created', !!result?.id),
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findAll() {
    return await this.productSizeRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.productSizeRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException({
        message: `Màu sản phẩm với ID ${id} không tồn tại`,
      });
    }
  }

  async findSizesAndProduct(search: string = '') {
    try {
      const arrayKeyword = search.split(';');
      const whereProduct: any[] = [];
      if (Number(arrayKeyword?.[1])) {
        whereProduct.push({ id: +arrayKeyword?.[1] });
      }
      return await this.productSizeRepository.find({
        where: [
          {
            type: Like(convertTextToLike(arrayKeyword?.[0])),
            product: [
              ...whereProduct,
              {
                name: Like(convertTextToLikeVi(arrayKeyword?.[1])),
              },
              {
                slug: Like(convertTextToLike(arrayKeyword?.[1])),
              },
            ],
          },
        ],
        relations: {
          product: true,
        },
        select: {
          type: true,
          id: true,
          isActive: true,
          product: {
            id: true,
            name: true,
            slug: true,
          },
        },
        take: 5,
      });
    } catch (error) {
      throw new NotFoundException({
        message: `Không tìm thấy size ${search}`,
      });
    }
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.productSizeRepository.find({
      where: [
        {
          type: keywordToLike,
        },
      ],
      take: 10,
    });
  }

  async update(id: number, updateProductSizeDto: UpdateProductSizeDto) {
    try {
      const findExists = await this.productSizeRepository.findOneByOrFail({
        id,
      });
      Object.assign(findExists, updateProductSizeDto);
      const result = await this.productSizeRepository.save(findExists);
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
    const findBrand = await this.productSizeRepository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.productSizeRepository.delete({
      id: findBrand?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findBrand = await this.productSizeRepository.findBy({
        id: In(ids),
      });
      if (!findBrand.length) return;
      const result = await this.productSizeRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}
