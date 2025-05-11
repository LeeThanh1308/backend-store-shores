import * as crypto from 'crypto';
import * as querystring from 'qs';

import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';

import { CartsService } from 'src/carts/carts.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Order } from 'src/orders/entities/order.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { messages } from './types/interfaces/message.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';
import { TempOrder } from 'src/temp-orders/entities/temp-order.entity';
import { MyCartsResponse } from 'src/carts/types/my-carts-response.type';
import {
  OrderPaymentMethod,
  OrderPaymentStatus,
} from './types/enum/status-payment.enum';
import { Accounts } from 'src/accounts/entities/account.entity';
import { generateMessage } from 'src/common/messages/index.messages';
import moment from 'moment';
import { Branch } from 'src/branches/entities/branch.entity';

@Injectable()
export class PaymentsService {
  private readonly storeItemsRepository: Repository<StoreItem>;
  private readonly tempOrderRepository: Repository<TempOrder>;
  private readonly orderRepository: Repository<Order>;
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly cartService: CartsService,
  ) {
    this.storeItemsRepository = this.dataSource.getRepository(StoreItem);
    this.tempOrderRepository = this.dataSource.getRepository(TempOrder);
    this.orderRepository = this.dataSource.getRepository(Order);
  }

  async sortObject(obj: { [key: string]: any }) {
    const sorted: { [key: string]: string } = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sorted[encodeURIComponent(key)] = encodeURIComponent(obj[key]).replace(
        /%20/g,
        '+',
      );
    }

    return sorted;
  }
  async handleCreateBankTransferOrder(
    amount: number,
    ipAddr: any,
    orderId: number,
  ) {
    try {
      const currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() - 20);
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');
      const tmnCode = process.env.VNP_TMNCODE;
      const secretKey = process.env.VNP_HASHSECRET!;
      let vnpUrl = process.env.VNP_URL;
      const returnUrl = process.env.DOMAIN + '/' + process.env.VNP_RETURNUR;
      const currCode = 'VND';
      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = 'vi';
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      vnp_Params = await this.sortObject(vnp_Params);
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
      return vnpUrl;
    } catch (e) {
      throw e;
    }
  }

  async handleCreateDataPayment(
    userID: string,
    createPaymentDto: CreatePaymentDto,
    ipAddr: any,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const carts: MyCartsResponse = await this.cartService.handleGetMyCarts({
        id: userID,
      });
      if (!carts?.items?.length) {
        throw new BadRequestException({
          messages: 'Giỏ hàng đang trống',
        });
      }
      const createPayment = this.paymentsRepository.create({
        ...createPaymentDto,
        paymentMethod:
          createPaymentDto.paymentMethod == 'transfer'
            ? OrderPaymentMethod.TRANSFER
            : OrderPaymentMethod.CASH,
      });
      const tempOrders: TempOrder[] = await Promise.all(
        carts?.items?.map(async (_) => {
          const {
            id: storeId,
            sold,
            inventory,
          } = await this.cartService.handleFindTotalSold(_.color.id, _.size.id);
          if (!storeId || _?.quantity > inventory) {
            throw new ConflictException();
          }
          return this.tempOrderRepository.create({
            name: _.name,
            account: {
              id: userID,
            },
            quantity: _?.quantity,
            totalAmount:
              _?.sellingPrice * (1 - _?.discount / 100) * _?.quantity,
            size: {
              id: _.size.id,
            },
            product: {
              id: _?.productId,
            },
            color: { id: _?.color.id },
            storeItem: { id: storeId },
          });
        }),
      );
      if (createPaymentDto.paymentMethod == 'transfer') {
        const data = await queryRunner.manager.save(Payment, {
          ...createPayment,
          price: carts.total,
          tempOrders,
          paymentMethod: OrderPaymentMethod.TRANSFER,
          paymentStatus: OrderPaymentStatus.PENDING,
          account: {
            id: userID,
          },
        });
        const url = await this.handleCreateBankTransferOrder(
          carts.total,
          ipAddr,
          data.id,
        );
        if (url) {
          throw new HttpException(
            {
              statusCode: HttpStatus.MOVED_PERMANENTLY,
              message: 'Redirecting...',
              redirect: url,
            },
            HttpStatus.MOVED_PERMANENTLY,
          );
        } else {
          throw new BadRequestException();
        }
        // await this.cartService.handleClearsCarts({ id: userID });
      } else if (createPaymentDto.paymentMethod == 'cash') {
        const data = await queryRunner.manager.save(Payment, {
          ...createPayment,
          price: carts.total,
          tempOrders,
          paymentMethod: OrderPaymentMethod.CASH,
          paymentStatus: OrderPaymentStatus.PROCESSING,
          account: {
            id: userID,
          },
        });
        // await this.cartService.handleClearsCarts({ id: userID });
        await queryRunner.commitTransaction();
        return data;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleCreatedDataPaymentCashier(
    userID: string,
    createPaymentDto: CreatePaymentDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const carts: MyCartsResponse =
        await this.cartService.handleGetCashiersCarts({
          id: userID,
        });
      if (!carts?.items?.length) {
        throw new BadRequestException({
          messages: 'Giỏ hàng đang trống',
        });
      }
      const createPayment = this.paymentsRepository.create({
        ...createPaymentDto,
        paymentMethod:
          createPaymentDto.paymentMethod == 'transfer'
            ? OrderPaymentMethod.TRANSFER
            : OrderPaymentMethod.CASH,
      });
      const tempOrders: TempOrder[] = await Promise.all(
        carts?.items?.map(async (_) => {
          const {
            id: storeId,
            sold,
            inventory,
          } = await this.cartService.handleFindTotalSold(_.color.id, _.size.id);
          if (!storeId || _?.quantity > inventory) {
            throw new ConflictException();
          }
          return this.tempOrderRepository.create({
            name: _.name,
            staff: {
              id: userID,
            },
            quantity: _?.quantity,
            totalAmount:
              _?.sellingPrice * (1 - _?.discount / 100) * _?.quantity,
            size: {
              id: _.size.id,
            },
            product: {
              id: _?.productId,
            },
            color: { id: _?.color.id },
            storeItem: { id: storeId },
          });
        }),
      );
      if (createPaymentDto.paymentMethod == 'transfer') {
        // await this.cartService.handleClearsCarts({ id: userID });
      } else if (createPaymentDto.paymentMethod == 'cash') {
        const data = await queryRunner.manager.save(Payment, {
          ...createPayment,
          price: carts.total,
          tempOrders,
          paymentMethod: OrderPaymentMethod.CASH,
          paymentStatus: OrderPaymentStatus.DELIVERED,
          staff: {
            id: userID,
          },
        });
        const removeId = await Promise.all(
          data.tempOrders.map((_) => {
            const { id, ...props } = _;
            return props;
          }),
        );
        const createOrders = this.orderRepository.create(removeId);
        await queryRunner.manager.save(Order, createOrders);
        await this.cartService.handleClearsCarts({ id: userID });
        await queryRunner.commitTransaction();
        return {
          ...generateMessage('Đơn hàng', 'updated', true),
          data,
        };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleGetMyOrders(account: Partial<Accounts>) {
    return await this.paymentsRepository.find({
      relations: {
        tempOrders: {
          product: true,
          size: true,
          color: true,
        },
      },
      where: {
        account: {
          id: account.id,
        },
      },
      select: {
        id: true,
        paymentMethod: true,
        paymentStatus: true,
        price: true,
        receiver: true,
        phone: true,
        address: true,
        note: true,
        tempOrders: {
          name: true,
          quantity: true,
          totalAmount: true,
          size: {
            type: true,
          },
          color: {
            name: true,
          },
          product: {
            name: true,
          },
        },
      },
    });
  }

  async handleGetOrdersAdmin(filter: string) {
    const whereConditions: any = {};
    const orderBy: any = {
      createdAt: 'DESC',
    };
    if (filter == 'orders') {
      whereConditions.paymentStatus = OrderPaymentStatus.PROCESSING;
      orderBy.createdAt = 'ASC';
    }
    return await this.paymentsRepository.find({
      relations: {
        tempOrders: {
          product: true,
          size: true,
          color: true,
        },
      },
      where: whereConditions,
      select: {
        id: true,
        paymentMethod: true,
        paymentStatus: true,
        price: true,
        receiver: true,
        phone: true,
        address: true,
        note: true,
        createdAt: true,
        tempOrders: {
          name: true,
          quantity: true,
          totalAmount: true,
          size: {
            type: true,
          },
          color: {
            name: true,
          },
          product: {
            name: true,
          },
        },
      },
      order: orderBy,
    });
  }

  async handleGetVnpayReturn(
    vnp_Params: any,
    secureHash: string,
  ): Promise<{ code: any; message: string; status: boolean }> {
    vnp_Params = await this.sortObject(vnp_Params);
    // const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.VNP_HASHSECRET!;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    const resCode = vnp_Params['vnp_ResponseCode'];
    if (secureHash === signed) {
      if (resCode === '00') {
        // const isExist = await this.orderService.create(vnp_Params.vnp_TxnRef, vnp_Params.vnp_Amount);
        // if (!isExist) {
        //   return { code: '97', message: messages['97'], status: false };
        // }
        // await this.cartService.handlePaymentClearCarts(isExist.account.id, isExist.id);
        return { code: resCode, message: messages[resCode], status: true };
      } else {
        return { code: resCode, message: messages[resCode], status: false };
      }
    } else {
      return { code: '97', message: messages['97'], status: false };
    }
  }

  async handleUpdatedOrdersAdmin(updatePaymentDto: UpdatePaymentDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findPaymentOrders = await this.paymentsRepository.findOne({
        relations: {
          tempOrders: {
            product: true,
            size: true,
            color: true,
            account: true,
            storeItem: true,
            payment: true,
          },
        },
        where: {
          id: updatePaymentDto.id,
        },
        select: {
          id: true,
          paymentMethod: true,
          price: true,
          receiver: true,
          phone: true,
          address: true,
          note: true,
          tempOrders: {
            id: true,
            name: true,
            quantity: true,
            totalAmount: true,
            storeItem: {
              id: true,
            },
            account: {
              id: true,
            },
            size: {
              id: true,
            },
            color: {
              id: true,
            },
            product: {
              id: true,
            },
          },
        },
      });
      if (!findPaymentOrders) {
        throw new NotFoundException();
      }
      const { tempOrders, ...props } = findPaymentOrders;
      const updated = await queryRunner.manager.save(Payment, {
        ...props,
        paymentStatus: OrderPaymentStatus?.[updatePaymentDto.paymentStatus],
      });
      if (updatePaymentDto.paymentStatus == 'DELIVERED') {
        const removeId = await Promise.all(
          tempOrders.map((_) => {
            const { id, ...props } = _;
            return props;
          }),
        );
        const createOrders = this.orderRepository.create(removeId);
        const data = await queryRunner.manager.save(Order, createOrders);
        await queryRunner.commitTransaction();
        return {
          ...generateMessage('Đơn hàng', 'updated', true),
          data,
          updated,
        };
      } else {
        const findOrderRollback = await this.orderRepository.find({
          where: {
            payment: {
              id: findPaymentOrders.id,
            },
          },
        });
        await queryRunner.manager.remove(Order, findOrderRollback);
        await queryRunner.commitTransaction();
        return {
          ...generateMessage('Đơn hàng', 'updated', true),
          updated,
        };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
