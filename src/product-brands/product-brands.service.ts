import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductBrandDto } from './dto/create-product-brand.dto';
import { UpdateProductBrandDto } from './dto/update-product-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductBrand } from './entities/product-brand.entity';
import { In, Like, Repository } from 'typeorm';
import { FilesService } from 'src/files/files.service';
import { generateMessage } from 'src/common/messages/index.messages';
import { convertTextToLike } from 'utils';

@Injectable()
export class ProductBrandsService {
  private readonly nameMessage = 'Thương hiệu sản phẩm';
  constructor(
    @InjectRepository(ProductBrand)
    private readonly brandsRepository: Repository<ProductBrand>,
    private readonly fileServices: FilesService,
  ) {}
  async create(
    createProductBrandDto: CreateProductBrandDto,
    file?: Express.Multer.File,
  ) {
    try {
      if (file) {
        const pathFile = await this.fileServices.uploadFile(file, 'brands');
        createProductBrandDto.logo = pathFile.filePath;
      }
      const createBrand = this.brandsRepository.create(createProductBrandDto);
      await this.brandsRepository.save(createBrand);
      return {
        ...generateMessage(this.nameMessage, 'created', true),
        data: createBrand,
      };
    } catch (error) {
      console.log(error);
      if (createProductBrandDto.logo) {
        await this.fileServices.deleteFile(createProductBrandDto.logo);
      }
    }
  }

  async findAll() {
    return await this.brandsRepository.find();
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.brandsRepository.find({
      where: [
        {
          name: keywordToLike,
        },
        {
          slug: keywordToLike,
        },
      ],
      take: 10,
    });
  }

  async findOne(id: number) {
    return await this.brandsRepository.findOneBy({ id: id });
  }

  async update(
    id: number,
    updateProductBrandDto: UpdateProductBrandDto,
    file?: Express.Multer.File,
  ) {
    try {
      const findBrandExists = await this.brandsRepository.findOne({
        where: { id },
      });
      if (!findBrandExists)
        throw new NotFoundException(
          `Thương hiệu sản phẩm với ID ${id} không tồn tại`,
        );
      if (file) {
        const pathFile = await this.fileServices.uploadFile(file, 'brands');
        updateProductBrandDto.logo = pathFile.filePath;
        if (findBrandExists.logo)
          await this.fileServices.deleteFile(findBrandExists.logo);
      }
      Object.assign(findBrandExists, updateProductBrandDto);
      const updatedBrand = await this.brandsRepository.save(findBrandExists);
      return {
        ...generateMessage(this.nameMessage, 'updated', true),
        data: updatedBrand,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeOne(id: number) {
    const findBrand = await this.brandsRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'logo'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    if (findBrand.logo) {
      await this.fileServices.deleteFile(findBrand.logo);
    }
    const result = await this.brandsRepository.delete({ id: findBrand?.id });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findBrand = await this.brandsRepository.findBy({ id: In(ids) });
      if (!findBrand.length) return;
      await Promise.all(
        findBrand.map(async (it) => {
          if (it.logo) {
            return await this.fileServices.deleteFile(it.logo);
          }
          return;
        }),
      );
      const result = await this.brandsRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}
