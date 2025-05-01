import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { DataSource, In, Like, Repository } from 'typeorm';
import { convertTextToLike } from 'utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { generateMessage } from 'src/common/messages/index.messages';
import { StoreItem } from 'src/store-items/entities/store-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Accounts } from 'src/accounts/entities/account.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';

@Injectable()
export class StoresService {
  private readonly nameMessage = 'Kho hàng';
  private productsRepository: Repository<Product>;
  private sizesRepository: Repository<ProductSize>;
  private branchRepository: Repository<Branch>;
  private colorsRepository: Repository<ProductColor>;
  private storeItemsRepository: Repository<StoreItem>;
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    private readonly dataSource: DataSource,
  ) {
    this.productsRepository = this.dataSource.getRepository(Product);
    this.sizesRepository = this.dataSource.getRepository(ProductSize);
    this.branchRepository = this.dataSource.getRepository(Branch);
    this.colorsRepository = this.dataSource.getRepository(ProductColor);
    this.storeItemsRepository = this.dataSource.getRepository(StoreItem);
  }
  async create(createStoreDto: CreateStoreDto, user: Accounts) {
    try {
      const { items, ...args } = createStoreDto;
      const findBranch = await this.branchRepository.findOne({
        select: ['id'],
        where: {
          id: createStoreDto?.branchID,
        },
      });
      Object.assign(args, { branch: findBranch });
      const createStore = this.storesRepository.create({
        ...args,
        createdBy: user,
      });
      const store = await this.storesRepository.save(createStore);
      const createItems = await Promise.all(
        items.map(async (_) => {
          const storeItem = new StoreItem();
          const product = await this.productsRepository.findOne({
            select: { id: true },
            where: {
              id: _.productID,
            },
          });
          const sizes = await this.sizesRepository.findOne({
            select: { id: true },
            where: {
              id: _.sizeID,
            },
          });
          const findColor = +_.colorID
            ? await this.colorsRepository.findOne({
                select: { id: true },
                where: {
                  id: _?.colorID,
                },
              })
            : null;
          storeItem.quantity = _.quantity;
          if (product) storeItem.product = product;
          if (sizes) storeItem.size = sizes;
          if (findColor) storeItem.color = findColor;
          storeItem.store = store;
          return storeItem;
        }),
      );
      const findColorIDNotExist = await Promise.all(
        createItems.filter((_) => {
          if (!_?.color) {
            return _;
          }
        }),
      );
      const findColorIDExist = await Promise.all(
        createItems.filter((_) => {
          if (_?.color) {
            return _;
          }
        }),
      );
      const findColors = findColorIDNotExist?.[0]?.product?.id
        ? await this.colorsRepository.find({
            select: ['id'],
            where: {
              products: {
                id: findColorIDNotExist[0].product.id,
              },
            },
          })
        : [];

      if (Array.isArray(findColorIDExist) && findColorIDExist.length > 0) {
        const createItems = this.storeItemsRepository.create(findColorIDExist);
        await this.storeItemsRepository.save(createItems);
      }
      await Promise.all(
        findColors.map(async (color) => {
          const items = await Promise.all(
            findColorIDNotExist.map((_) => {
              const storeItems = new StoreItem();
              storeItems.quantity = _.quantity;
              storeItems.product = _.product;
              storeItems.size = _.size;
              storeItems.color = color;
              storeItems.store = _.store;
              return storeItems;
            }),
          );
          const createItems = await this.storeItemsRepository.create(items);
          return await this.storeItemsRepository.save(createItems);
        }),
      );

      return {
        ...generateMessage(this.nameMessage, 'created', true),
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    return await this.storesRepository.find({
      relations: {
        items: {
          size: true,
          product: true,
        },
        createdBy: {
          roles: true,
        },
      },
      select: {
        items: {
          id: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          product: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          fullname: true,
          roles: {
            description: true,
          },
        },
      },
    });
  }

  async handleFindBranchID(branchID: number) {
    return await this.storesRepository.find({
      where: {
        branch: {
          id: branchID,
        },
      },
      relations: {
        items: {
          size: true,
          product: true,
          color: true,
        },
        createdBy: {
          roles: true,
        },
      },
      select: {
        items: {
          id: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          product: {
            id: true,
            name: true,
            sellingPrice: true,
            costPrice: true,
          },
        },
        createdBy: {
          fullname: true,
          roles: {
            description: true,
          },
        },
      },
    });
  }

  async searchByKeyword(keyword: string) {
    const keywordToLike = Like(convertTextToLike(keyword));
    return await this.storesRepository.find({
      where: [],
      take: 10,
    });
  }

  async findOne(id: number) {
    return await this.storesRepository.findOne({
      relations: {
        items: {
          color: true,
          product: true,
        },
      },
      where: { id: id },
    });
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
    try {
      const findStore = await this.storesRepository.findOne({
        where: {
          id,
        },
      });
      if (!findStore?.id) {
        throw new ConflictException('ID không hợp lệ.');
      }
      const result = await this.storesRepository.delete({ id: findStore?.id });
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw error;
    }
  }

  async removeMany(ids: number[]) {
    try {
      const findStore = await this.storesRepository.findBy({ id: In(ids) });
      if (!findStore.length) throw new ConflictException('ID không hợp lệ.');
      const result = await this.storesRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      return error;
    }
  }
}
