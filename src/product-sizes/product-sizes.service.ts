import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSize } from './entities/product-size.entity';
import { ILike, In, Like, Repository } from 'typeorm';
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

  async findSizesAndProduct(search: string = '', productID: number) {
    try {
      const searchToLike = Like(convertTextToLike(search));
      const whereProduct: any[] = [];
      if (Number(search)) {
        whereProduct.push({ id: +search });
      }
      return await this.productSizeRepository.find({
        where: [
          {
            type: searchToLike,
            product: {
              id: productID,
            },
          },
        ],
        take: 10,
      });
    } catch (error) {
      throw new NotFoundException({
        message: `Không tìm thấy size ${search}`,
      });
    }
  }

  async findSizesWhereProductID(productID: number) {
    return await this.productSizeRepository.find({
      where: {
        product: {
          id: productID,
        },
      },
    });
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
