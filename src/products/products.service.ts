import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { ProductBrand } from 'src/product-brands/entities/product-brand.entity';
import { TargetGroup } from 'src/target-groups/entities/target-group.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { convertTextToLike } from 'utils';
import { FilesService } from 'src/files/files.service';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { generateMessage } from 'src/common/messages/index.messages';

@Injectable()
export class ProductsService {
  private categoryRepository: Repository<Category>;
  private brandRepository: Repository<ProductBrand>;
  private targetGroupRepository: Repository<TargetGroup>;
  private colorsRepository: Repository<ProductColor>;
  private imagesRepository: Repository<ProductImage>;
  private readonly folderPath = 'products';
  private readonly messageName = 'Products';
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
  ) {
    this.categoryRepository = dataSource.getRepository(Category);
    this.brandRepository = dataSource.getRepository(ProductBrand);
    this.targetGroupRepository = dataSource.getRepository(TargetGroup);
    this.colorsRepository = dataSource.getRepository(ProductColor);
    this.imagesRepository = dataSource.getRepository(ProductImage);
  }
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    let fileUrls: string[] = [];
    try {
      const validatorMessage = {};
      // this.filesService.uploadFiles(files, this.folderPath);
      const { brandID, targetGroupID, categoryID, colors, sizes, ...data } =
        createProductDto;
      const findCategoryExists = await this.categoryRepository.findOne({
        where: { id: categoryID },
      });
      const findBrandExists = await this.brandRepository.findOneBy({
        id: brandID,
      });
      const findTargetGroupExists = await this.targetGroupRepository.findOneBy({
        id: targetGroupID,
      });
      const findColorsExists = await this.colorsRepository.find({
        where: {
          id: In(colors.map((_) => _.id)),
        },
        select: ['id'],
      });
      if (!findCategoryExists) {
        validatorMessage['category'] = 'Category not found';
      }
      if (!findBrandExists) {
        validatorMessage['brand'] = 'Brand not found';
      }
      if (!findTargetGroupExists) {
        validatorMessage['targetGroup'] = 'Target group not found';
      }
      if (findColorsExists?.length == 0) {
        validatorMessage['colorIds'] = 'Color not found';
      }
      if (
        !findCategoryExists ||
        !findBrandExists ||
        findColorsExists?.length == 0
      )
        throw new ConflictException({
          validator: validatorMessage,
        });
      fileUrls = await this.filesService.uploadFiles(files, this.folderPath);
      const productImages: ProductImage[] = [];
      await Promise.all(
        colors.map(async (_, index) => {
          const { id, lengImage } = _;
          const result = await Promise.all(
            fileUrls.splice(0, lengImage).map((url) => {
              const productImage = new ProductImage();
              productImage.color = findColorsExists[index];
              productImage.src = url;
              productImages.push(productImage);
              return productImage;
            }),
          );
          return result;
        }),
      );
      console.log(productImages);
      const createProduct = this.productRepository.create({
        ...data,
        category: findCategoryExists,
        brand: findBrandExists,
        targetGroup: {
          id: targetGroupID,
        },
        colors: findColorsExists,
        sizes: sizes,
        images: productImages,
      });

      const result = await this.productRepository.save(createProduct);
      return {
        ...generateMessage(this.messageName, 'created', true),
      };
    } catch (error) {
      console.log(error);
      await this.filesService.deleteFiles(fileUrls);
      throw new HttpException(
        generateMessage(this.messageName, 'created', false),
        error.status || 404,
      );
    }
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.productRepository.find({
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
  async findAll() {
    return await this.productRepository.find({
      relations: {
        images: {
          color: true,
        },
        sizes: true,
        colors: true,
        brand: true,
        targetGroup: true,
        category: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.imagesRepository
      .find({
        select: ['src'],
      })
      .then((data) => data.map((_) => _.src));
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    const validatorMessage = {};
    let fileUrls: string[] = [];
    const productImages: ProductImage[] = [];
    try {
      const {
        brandID,
        targetGroupID,
        categoryID,
        colors = [],
        sizes = [],
        removes,
        ...dataProduct
      } = updateProductDto;
      const findCategoryExists = await this.categoryRepository.findOne({
        where: { id: categoryID },
      });
      const findBrandExists = await this.brandRepository.findOneBy({
        id: brandID,
      });
      const findTargetGroupExists = await this.targetGroupRepository.findOneBy({
        id: targetGroupID,
      });
      const findColorsExists = await this.colorsRepository.find({
        where: {
          id: In(colors.map((_) => _.id)),
        },
        select: ['id'],
      });
      if (!findCategoryExists) {
        validatorMessage['category'] = 'Category not found';
      }
      if (!findBrandExists) {
        validatorMessage['brand'] = 'Brand not found';
      }
      if (!findTargetGroupExists) {
        validatorMessage['targetGroup'] = 'Target group not found';
      }
      if (colors?.length > 0 && findColorsExists?.length == 0) {
        validatorMessage['colorIds'] = 'Color not found';
      }

      if (
        !findCategoryExists ||
        !findBrandExists ||
        (findColorsExists?.length == 0 && colors?.length > 0)
      )
        throw new ConflictException({
          validator: validatorMessage,
        });
      if (files)
        fileUrls = await this.filesService.uploadFiles(files, this.folderPath);

      const createProduct = this.productRepository.create({
        id: id,
        ...dataProduct,
        category: findCategoryExists,
        brand: findBrandExists,
        targetGroup: {
          id: targetGroupID,
        },
        colors: findColorsExists,
        sizes: sizes,
      });

      await Promise.all(
        colors.map(async (_, index) => {
          const { lengImage } = _;
          const result = await Promise.all(
            fileUrls.splice(0, lengImage).map((url) => {
              const productImage = new ProductImage();
              productImage.color = findColorsExists[index];
              productImage.src = url;
              productImage.product = createProduct;
              productImages.push(productImage);
              return productImage;
            }),
          );
          return result;
        }),
      );
      if (Array.isArray(productImages) && productImages.length > 0) {
        const createProductImage = this.imagesRepository.create(productImages);
        await this.imagesRepository.save(createProductImage);
      }

      if (Array.isArray(removes?.images) && removes?.images?.length > 0) {
        const findImages = await this.imagesRepository.find({
          where: {
            id: In(removes.images),
          },
        });
        await this.imagesRepository.remove(findImages);
        await this.filesService.deleteFiles(findImages.map((_) => _.src));
      }

      return await this.productRepository.save(createProduct);
    } catch (error) {
      console.log(error);
      await this.filesService.deleteFiles(fileUrls);
      throw new HttpException(
        {
          ...generateMessage(this.messageName, 'updated', false),
          ...error?.response,
        },
        error.status || 404,
      );
    }
  }

  async removeOne(id: number) {
    const findBrand = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: {
        images: true,
      },
      select: ['id'],
    });
    if (!findBrand?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    if (findBrand?.images)
      await this.filesService.deleteFiles(findBrand?.images.map((_) => _.src));
    const result = await this.productRepository.delete({
      id: findBrand?.id,
    });
    return generateMessage(this.messageName, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[]) {
    try {
      const findBrand = await this.productRepository.find({
        where: { id: In(ids) },
        relations: {
          images: true,
        },
      });
      const findProductImages = await this.imagesRepository.find({
        where: {
          product: In(findBrand),
        },
      });
      if (!findBrand.length) return;
      const imageSrcs: string[] = findBrand.flatMap((product) =>
        product.images.map((image) => image?.src),
      );
      await this.filesService.deleteFiles(imageSrcs);
      const result = await this.productRepository.delete(ids);
      return generateMessage(this.messageName, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }
}
