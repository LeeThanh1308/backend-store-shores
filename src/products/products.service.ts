import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Between, DataSource, In, Like, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { ProductBrand } from 'src/product-brands/entities/product-brand.entity';
import { TargetGroup } from 'src/target-groups/entities/target-group.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { convertTextToLike, convertTextToLikeVi } from 'utils';
import { FilesService } from 'src/files/files.service';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { generateMessage } from 'src/common/messages/index.messages';
import { FiltersProductDto, SortOrder } from './dto/filters-product.dto';
import { Order } from 'src/orders/entities/order.entity';
import { Branch } from 'src/branches/entities/branch.entity';

@Injectable()
export class ProductsService {
  private branchesRepository: Repository<Branch>;
  private categoryRepository: Repository<Category>;
  private brandRepository: Repository<ProductBrand>;
  private targetGroupRepository: Repository<TargetGroup>;
  private colorsRepository: Repository<ProductColor>;
  private imagesRepository: Repository<ProductImage>;
  private ordersRepositoty: Repository<Order>;
  private readonly folderPath = 'products';
  private readonly messageName = 'Products';
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
  ) {
    this.categoryRepository = this.dataSource.getRepository(Category);
    this.brandRepository = this.dataSource.getRepository(ProductBrand);
    this.targetGroupRepository = this.dataSource.getRepository(TargetGroup);
    this.colorsRepository = this.dataSource.getRepository(ProductColor);
    this.imagesRepository = this.dataSource.getRepository(ProductImage);
    this.ordersRepositoty = this.dataSource.getRepository(Order);
    this.branchesRepository = this.dataSource.getRepository(Branch);
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
    let whereID: any = {};
    if (Number(keyword)) {
      whereID.id = +keyword;
    }
    const keywordToLike = Like(convertTextToLike(keyword));
    const results = await this.productRepository.find({
      relations: {
        images: true,
        colors: true,
      },
      where: [
        {
          name: keywordToLike,
        },
        {
          slug: Like(convertTextToLikeVi(keyword)),
        },
        {
          barcode: keywordToLike,
        },
        whereID,
      ],
      take: 10,
    });
    return results.map((_) => {
      return {
        ..._,
        image: _?.images?.[0]?.src,
      };
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

  async findProductBySlug(slug: string) {
    let whereOrders: any = {};
    let storeIDs: any[] = [];
    let branchWhere: any = {};
    const findProducts = await this.productRepository.findOne({
      relations: {
        images: true,
        colors: true,
        sizes: {
          items: {
            orders: true,
          },
        },
        targetGroup: true,
        brand: true,
      },
      where: {
        slug: Like(convertTextToLike(slug)),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        barcode: true,
        sellingPrice: true,
        discount: true,
        description: true,
        images: true,
        sizes: {
          id: true,
          sellingPrice: true,
          type: true,
          discount: true,
          isActive: true,
          items: {
            id: true,
            quantity: true,
            store: {
              id: true,
            },
            orders: true,
          },
        },
      },
    });

    const findBranch = await Promise.all(
      findProducts?.sizes.map(async (_) => {
        const findBranch = await this.branchesRepository.find({
          where: {
            stores: {
              items: {
                size: {
                  id: _?.id,
                },
              },
            },
          },
        });
        return {
          ..._,
          branches: findBranch,
        };
      }) ?? [],
    );

    if (findProducts?.items) {
      branchWhere.items = findProducts?.items;
    }

    const findColorsByImage = await this.colorsRepository.find({
      relations: {
        images: true,
      },
      where: {
        images: findProducts?.images,
      },
    });
    if (findProducts?.sizes) {
      whereOrders.size = In(findProducts?.sizes.map((_) => _?.id));
    }
    const findOrders = await this.ordersRepositoty.find({
      relations: {
        size: true,
      },
      where: {
        ...whereOrders,
      },
    });

    const handleSumSoldItems = findBranch?.map((size) => {
      const items = size.items.map((item) => {
        const total = item.orders.reduce(
          (acc, order) => (acc += order.quantity),
          0,
        );
        const { orders, quantity, store, ...args } = item;
        return {
          quantity,
          inventory: item.quantity - total,
          sold: total,
          store: store,
        };
      });
      const { items: itemss, ...args } = size;
      return {
        ...args,
        ...items?.[0],
      };
    });

    return {
      ...findProducts,
      sizes: handleSumSoldItems,
      colors: findColorsByImage,
    };
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

  async searchFilter({
    useFilters,
    sortOrder,
    keyword,
    page = 1,
    limit = 10,
  }: FiltersProductDto) {
    try {
      const whereConditions: any = {
        isActive: true,
        sizes: { isActive: true },
      };
      const whereConditionAND: any = {};
      const keywordToLike = Like(convertTextToLike(keyword ?? ''));
      const {
        colors,
        brands,
        objects,
        categories,
        priceRange,
        object,
        brand,
        category,
      } = useFilters ?? {};
      if (object) {
        whereConditionAND.targetGroup = {
          name: object,
        };
      }
      if (brand) {
        whereConditionAND.brand = {
          name: brand,
        };
      }
      if (category) {
        whereConditionAND.category = {
          name: category,
        };
      }
      // Thêm các điều kiện tùy chọn vào `whereConditions`
      if (priceRange) {
        whereConditions.sellingPrice = Between(priceRange.min, priceRange.max);
      }
      if (brands) {
        whereConditions.brand = { name: In(brands) };
      }
      if (colors) {
        whereConditions.colors = { name: In(colors) };
      }
      if (objects) {
        whereConditions.targetGroup = { name: In(objects) };
      }

      if (Array.isArray(categories) && categories?.length > 0) {
        whereConditions.category = {
          name: In(categories),
        };
      }
      let orderCondition: any = {};
      switch (sortOrder) {
        case SortOrder.NEWEST:
          orderCondition = { createdAt: 'DESC' }; // Giả sử bạn có trường `createdAt`
          break;
        case SortOrder.OLDEST:
          orderCondition = { createdAt: 'ASC' };
          break;
        case SortOrder.PRICE_ASC:
          orderCondition = { sellingPrice: 'ASC' }; // Giả sử bạn có trường `sellingPrice`
          break;
        case SortOrder.PRICE_DESC:
          orderCondition = { sellingPrice: 'DESC' };
          break;
        default:
          orderCondition = {}; // Mặc định sắp xếp theo một trường cụ thể nếu cần
          break;
      }
      const findProducts = await this.productRepository.find({
        relations: {
          brand: true,
          sizes: true,
        },
        where: keyword
          ? [
              { ...whereConditions, name: keywordToLike }, // Tìm theo tên
              { ...whereConditions, slug: Like(convertTextToLikeVi(keyword)) }, // Tìm theo slug
              { ...whereConditions, barcode: keywordToLike }, // Tìm theo barcode
              { ...whereConditions, id: Number(keyword) ? Number(keyword) : 0 }, // Tìm theo id
            ]
          : {
              ...whereConditionAND,
              ...whereConditions,
            },
        select: {
          id: true,
          name: true,
          slug: true,
          barcode: true,
          sellingPrice: true,
          discount: true,
          sizes: {
            id: true,
            sellingPrice: true,
            type: true,
            discount: true,
          },
          brand: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        skip: (+page - 1) * +limit,
        take: +limit,
        order: orderCondition,
      });
      // return findProducts;
      const findImageColors = await Promise.all(
        findProducts.map(async (_) => {
          const findProductColors = await this.colorsRepository.find({
            relations: {
              images: true,
            },
            where: {
              images: {
                product: {
                  id: _.id,
                },
              },
              products: {
                id: _.id,
              },
            },
            select: {
              id: true,
              name: true,
              hexCode: true,
              images: true,
            },
          });
          return {
            ..._,
            colors: findProductColors,
          };
        }),
      );
      const productIDs = await Promise.all(findProducts.map((_) => _?.id));
      const findColors = await this.colorsRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
        order: {
          id: 'ASC',
        },
      });

      const findCategories = await this.categoryRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
      });

      const findObjects = await this.targetGroupRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
        order: {
          id: 'ASC',
        },
      });

      const findBrands = await this.brandRepository.find({
        where: {
          products: {
            id: In(productIDs),
          },
        },
        order: {
          id: 'ASC',
        },
      });
      const countProduct = await this.productRepository.count({
        where: keyword
          ? [
              { ...whereConditions, name: keywordToLike }, // Tìm theo tên
              { ...whereConditions, slug: Like(convertTextToLikeVi(keyword)) }, // Tìm theo slug
              { ...whereConditions, barcode: keywordToLike }, // Tìm theo barcode
              { ...whereConditions, id: Number(keyword) ? Number(keyword) : 0 }, // Tìm theo id
            ]
          : {
              ...whereConditionAND,
              ...whereConditions,
            },
      });

      return {
        products: findImageColors,
        totalPage: Math.ceil(countProduct / +limit),
        limit: +limit,
        filters: {
          colors: findColors,
          objects: findObjects,
          brands: findBrands,
          categories: findCategories,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async handleGetTrendings(
    page: number | string = 1,
    limit: number | string = 10,
  ) {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.orders', 'order')
      .leftJoin('product.sizes', 'sizes')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.colors', 'colors')
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.barcode',
        'product.sellingPrice',
        'product.discount',
        'sizes.id',
        'sizes.sellingPrice',
        'sizes.type',
        'sizes.discount',
        'sizes.isActive',
        'brand.id',
        'brand.name',
        'brand.slug',
        'colors.id',
        'colors.name',
        'colors.hexCode',
        'SUM(order.quantity) AS total_quantity',
      ])
      .leftJoinAndSelect('product.images', 'images')
      .groupBy('product.id')
      .addGroupBy('sizes.id')
      .orderBy('total_quantity', 'DESC')
      .skip((+page - 1) * +limit)
      .take(+limit)
      .getManyAndCount();
    return {
      products: result?.[0],
      totalPage: Math.ceil(result?.[1] / +limit),
    };
  }

  async handleGetProductBrands() {
    const findBrands = await this.brandRepository.find();

    return await Promise.all(
      findBrands.map(async (_) => {
        const products = await this.productRepository
          .createQueryBuilder('product')
          .leftJoin('product.orders', 'order')
          .leftJoin('product.sizes', 'sizes')
          .leftJoin('product.colors', 'colors')
          .leftJoin('product.items', 'items')
          .select([
            'product.id',
            'product.name',
            'product.slug',
            'product.barcode',
            'product.sellingPrice',
            'product.discount',
            'sizes.id',
            'sizes.sellingPrice',
            'sizes.type',
            'sizes.discount',
            'sizes.isActive',
            'colors.id',
            'colors.name',
            'colors.hexCode',
            'SUM(items.quantity) AS itemQuantity',
            'SUM(order.quantity) AS orderQuantity',
          ])
          .leftJoinAndSelect('product.images', 'images')
          .where('product.brandId = :brandId', { brandId: _.id })
          .groupBy('product.id')
          .addGroupBy('sizes.id')
          .addGroupBy('colors.id')
          .having('orderQuantity < itemQuantity')
          .orderBy('orderQuantity', 'DESC')
          .take(10)
          .getMany();

        return {
          ..._,
          products,
        };
      }),
    );
  }

  async handleCountTotalProducts() {
    return await this.productRepository.count();
  }
}
