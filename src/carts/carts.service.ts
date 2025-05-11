import { CreateCartDto } from './dto/create-cart.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Accounts } from 'src/accounts/entities/account.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { generateMessage } from 'src/common/messages/index.messages';
import { Product } from 'src/products/entities/product.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { Order } from 'src/orders/entities/order.entity';
import { MyCartsResponse } from './types/my-carts-response.type';
import { StoreItem } from 'src/store-items/entities/store-item.entity';

@Injectable()
export class CartsService {
  private nameMessage = 'Giỏ hàng';
  private sizesRepository: Repository<ProductSize>;
  private productsRepository: Repository<Product>;
  private imagesRepository: Repository<ProductImage>;
  private storeItemRepository: Repository<StoreItem>;
  private orderRepository: Repository<Order>;
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly dataSource: DataSource,
  ) {
    this.sizesRepository = this.dataSource.getRepository(ProductSize);
    this.productsRepository = this.dataSource.getRepository(Product);
    this.imagesRepository = this.dataSource.getRepository(ProductImage);
    this.storeItemRepository = this.dataSource.getRepository(StoreItem);
    this.orderRepository = this.dataSource.getRepository(Order);
  }

  calculateTotal(cartItems: any) {
    return cartItems.reduce(
      (acc, item) => {
        const quantity = item.quantity;
        const { product, ...size } = item?.size ?? {};
        const sizePrice = parseFloat(size?.sellingPrice);
        const productPrice = parseFloat(product?.sellingPrice);
        const discount = size?.discount || 0;
        const dataItems = {
          ...product,
          productId: product.id,
          size,
          discount: +size?.discount ? size?.discount : product?.discount,
          sellingPrice: +size?.sellingPrice
            ? size?.sellingPrice
            : product?.sellingPrice,
          id: item?.id,
          quantity: item?.quantity,
          color: item?.color,
        };
        // Chọn giá hợp lệ
        let price = 0;
        if (sizePrice > 0) {
          price = sizePrice;
        } else if (productPrice > 0) {
          price = productPrice;
        } else {
          acc.items.push(dataItems);
          return acc; // Bỏ qua nếu không có giá
        }

        // Áp dụng giảm giá nếu có
        if (discount > 0 && discount <= 100) {
          price = price * (1 - discount / 100);
        }
        acc.items.push(dataItems);
        acc.total = acc.total + quantity * price;
        return acc;
      },
      { items: [], total: 0 },
    );
  }

  async handleFindTotalSold(
    colorId: number,
    sizeId: number,
    branchId?: number | null,
  ): Promise<{ sold: number; inventory: number; id: number | null }> {
    const whereConditions: any = {};
    if (Number(branchId)) {
      whereConditions.store = {
        branch: {
          id: branchId,
        },
      };
    }
    const storeItem = await this.storeItemRepository.findOne({
      where: {
        color: { id: colorId },
        size: { id: sizeId },
        ...whereConditions,
      },
      relations: ['product', 'color', 'size'],
    });
    if (!storeItem) {
      return {
        id: null,
        sold: 0,
        inventory: 0,
      };
    }
    // 2. Tính tổng số lượng đã bán từ Order
    const queryOrder = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.storeItem', 'item')
      .leftJoin('item.store', 'store')
      .leftJoin('store.branch', 'branch')
      .where('order.storeItemId = :storeItemId', { storeItemId: storeItem.id })
      .select('SUM(order.quantity)', 'sum');
    if (Number(branchId)) {
      queryOrder.andWhere('branch.id = :id', { id: branchId });
    }
    const totalSold = await queryOrder.getRawOne();
    const soldQuantity = Number(totalSold.sum) || 0;

    // 3. Tính tồn kho
    const remainingStock = storeItem.quantity - soldQuantity;
    return {
      id: storeItem.id,
      sold: soldQuantity,
      inventory: remainingStock,
    };
  }
  async checkStockAvailability(
    productId: number,
    colorId: number,
    sizeId: number,
    inputQuantity: number,
  ): Promise<boolean> {
    // 1. Tìm StoreItem
    const { sold, inventory } = await this.handleFindTotalSold(colorId, sizeId);
    // 4. So sánh với số lượng yêu cầu từ người dùng
    return inventory >= inputQuantity;
  }

  async create(createCartDto: CreateCartDto, user: Accounts) {
    // console.log(user);
    try {
      console.log(createCartDto);
      const findProducts = await this.productsRepository.findOne({
        relations: {
          colors: true,
        },
        where: {
          sizes: {
            id: createCartDto.sizeID,
          },
          colors: {
            id: createCartDto.colorID,
          },
        },
      });
      if (!findProducts) {
        throw new NotFoundException({
          message: 'ID colors or sizes không hợp lệ.',
        });
      }
      const { sold, inventory } = await this.handleFindTotalSold(
        createCartDto.colorID,
        createCartDto.sizeID,
      );
      if (inventory < createCartDto.quantity) {
        throw new ConflictException({
          validators: {
            quantity: 'Số lượng không hợp lệ.',
          },
        });
      }
      const findCartSizeExists = await this.cartRepository.findOne({
        relations: {
          color: true,
          size: true,
        },
        where: {
          size: {
            id: createCartDto.sizeID,
          },
          color: {
            id: createCartDto.colorID,
          },
          account: {
            id: user.id,
          },
        },
      });

      if (findCartSizeExists) {
        const createCart = this.cartRepository.create({
          ...findCartSizeExists,
          quantity: findCartSizeExists.quantity + createCartDto.quantity,
        });
        await this.cartRepository.save(createCart);
        return {
          ...generateMessage(this.nameMessage, 'updated', true),
        };
      } else {
        const createCart = this.cartRepository.create({
          ...createCartDto,
          size: {
            id: createCartDto.sizeID,
          },
          color: {
            id: createCartDto.colorID,
          },
          account: {
            id: user.id,
          },
        });
        await this.cartRepository.save(createCart);
        return {
          ...generateMessage(this.nameMessage, 'created', true),
        };
      }
    } catch (error) {
      // console.log(error);
      throw error;
    }
  }

  async handleCreateCashiersCarts(
    createCartDto: CreateCartDto,
    user: Accounts,
  ) {
    try {
      const findProducts = await this.productsRepository.findOne({
        relations: {
          colors: true,
        },
        where: {
          sizes: {
            id: createCartDto.sizeID,
          },
          colors: {
            id: createCartDto.colorID,
          },
        },
      });
      if (!findProducts) {
        throw new NotFoundException({
          message: 'ID colors or sizes không hợp lệ.',
        });
      }
      const { sold, inventory } = await this.handleFindTotalSold(
        createCartDto.colorID,
        createCartDto.sizeID,
      );
      if (inventory < createCartDto.quantity) {
        throw new ConflictException({
          validators: {
            quantity: 'Số lượng không hợp lệ.',
          },
        });
      }
      const findCartSizeExists = await this.cartRepository.findOne({
        relations: {
          color: true,
          size: true,
        },
        where: {
          size: {
            id: createCartDto.sizeID,
          },
          color: {
            id: createCartDto.colorID,
          },
          cashier: {
            id: user.id,
          },
        },
      });

      if (findCartSizeExists) {
        const createCart = this.cartRepository.create({
          ...findCartSizeExists,
          quantity: findCartSizeExists.quantity + createCartDto.quantity,
        });
        await this.cartRepository.save(createCart);
        return {
          ...generateMessage(this.nameMessage, 'updated', true),
        };
      } else {
        const createCart = this.cartRepository.create({
          ...createCartDto,
          size: {
            id: createCartDto.sizeID,
          },
          color: {
            id: createCartDto.colorID,
          },
          cashier: {
            id: user.id,
          },
        });
        await this.cartRepository.save(createCart);
        return {
          ...generateMessage(this.nameMessage, 'created', true),
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async handleGetCashiersCarts(
    user: Partial<Accounts>,
  ): Promise<MyCartsResponse> {
    try {
      const findCart = await this.cartRepository.find({
        relations: {
          size: {
            product: true,
            items: {
              orders: true,
            },
          },
          color: true,
        },
        where: {
          cashier: {
            id: user.id,
          },
        },
        select: {
          size: {
            id: true,
            type: true,
            sellingPrice: true,
            discount: true,
            product: {
              id: true,
              name: true,
              slug: true,
              sellingPrice: true,
              discount: true,
            },
            items: {
              id: true,
              quantity: true,
              orders: {
                quantity: true,
              },
            },
          },
        },
      });

      const resultCalc = await this.calculateTotal(findCart);
      const result = await Promise.all(
        resultCalc?.items?.map(async (item: Cart) => {
          const { items, ...size } = item?.size;
          const sold = items.reduce(
            (acc, _) => {
              _?.orders?.map((order) => {
                acc.sold += +order?.quantity;
              });
              acc.inventory += +_?.quantity - +acc?.sold;
              return acc;
            },
            { sold: 0, inventory: 0 },
          );
          const findImage = await this.imagesRepository.findOne({
            where: {
              color: {
                id: item?.color?.id,
              },
            },
          });
          return {
            ...item,
            size,
            sold,
            image: findImage?.src,
          };
        }),
      );

      return {
        ...resultCalc,
        items: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async handleGetMyCarts(user: Partial<Accounts>): Promise<MyCartsResponse> {
    try {
      const findCart = await this.cartRepository.find({
        relations: {
          size: {
            product: true,
            items: {
              orders: true,
            },
          },
          color: true,
        },
        where: {
          account: {
            id: user.id,
          },
        },
        select: {
          size: {
            id: true,
            type: true,
            sellingPrice: true,
            discount: true,
            product: {
              id: true,
              name: true,
              slug: true,
              sellingPrice: true,
              discount: true,
            },
            items: {
              id: true,
              quantity: true,
              orders: {
                quantity: true,
              },
            },
          },
        },
      });

      const resultCalc = await this.calculateTotal(findCart);
      const result = await Promise.all(
        resultCalc?.items?.map(async (item: Cart) => {
          const { items, ...size } = item?.size;
          const sold = items.reduce(
            (acc, _) => {
              _?.orders?.map((order) => {
                acc.sold += +order?.quantity;
              });
              acc.inventory += +_?.quantity - +acc?.sold;
              return acc;
            },
            { sold: 0, inventory: 0 },
          );
          const findImage = await this.imagesRepository.findOne({
            where: {
              color: {
                id: item?.color?.id,
              },
            },
          });
          return {
            ...item,
            size,
            sold,
            image: findImage?.src,
          };
        }),
      );
      // console.log(result);

      return {
        ...resultCalc,
        items: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.cartRepository.find({
      relations: {
        size: {
          product: true,
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  async update(id: number, updateCartDto: UpdateCartDto, user: Accounts) {
    try {
      if (!id) {
        throw new ConflictException({ id: 'ID không được để trống' });
      }
      const findCarts = await this.cartRepository.findOne({
        where: [
          {
            id,
            account: {
              id: user.id,
            },
          },
          {
            id,
            cashier: {
              id: user.id,
            },
          },
        ],
      });
      if (!findCarts) {
        throw new NotFoundException();
      }
      Object.assign(findCarts, updateCartDto);
      await this.cartRepository.save(findCarts);
      return {
        ...generateMessage(this.nameMessage, 'updated', true),
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
  async removeOne(id: number, user: Accounts) {
    const findCart = await this.cartRepository.findOne({
      where: [
        {
          id,
          account: {
            id: user.id,
          },
        },
        {
          id,
          cashier: {
            id: user.id,
          },
        },
      ],
      select: ['id'],
    });
    if (!findCart?.id) {
      return { message: 'ID không hợp lệ.' };
    }
    const result = await this.cartRepository.delete({
      id: findCart?.id,
    });
    return generateMessage(this.nameMessage, 'deleted', !!result.affected);
  }

  async removeMany(ids: number[], user: Accounts) {
    try {
      const findCart = await this.cartRepository.find({
        where: [
          {
            id: In(ids),
            account: {
              id: user.id,
            },
          },
          {
            id: In(ids),
            cashier: {
              id: user.id,
            },
          },
        ],
      });
      if (!findCart.length) return;
      const result = await this.cartRepository.delete(ids);
      return generateMessage(this.nameMessage, 'deleted', !!result.affected);
    } catch (error) {
      throw new Error(error);
    }
  }

  async handleClearsCarts(user: Partial<Accounts>) {
    try {
      const findCarts = await this.cartRepository.find({
        where: [
          {
            account: {
              id: user.id,
            },
          },
          {
            cashier: {
              id: user.id,
            },
          },
        ],
      });
      const statusRemove = await this.cartRepository.remove(findCarts);
      return generateMessage(this.nameMessage, 'deleted', !!statusRemove);
    } catch (error) {
      throw error;
    }
  }
}
