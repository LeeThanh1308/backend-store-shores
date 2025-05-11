import { CreateOrderDto } from './dto/create-order.dto';
import { Injectable } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }
  randomCreatedDate(year, month) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const randomDay =
      Math.floor(Math.random() * (end.getDate() - start.getDate() + 1)) + 1;
    const date = new Date(year, month, randomDay);
    return date.toISOString(); // Trả ra dạng string chuẩn ISO
  }

  async handleGetRevenues(
    startDate: number,
    endDate: number,
    branchID: number,
  ) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.product', 'product')
        .leftJoin('order.size', 'size')
        .leftJoin('order.storeItem', 'item')
        .leftJoin('item.store', 'store')
        .leftJoin('store.branch', 'branch')
        .select('DATE(order.createdAt)', 'date')
        .addSelect(
          `SUM(CASE WHEN size.costPrice = 0 THEN product.costPrice ELSE size.costPrice END * order.quantity)`,
          'totalCost',
        )
        .addSelect('SUM(order.totalAmount)', 'totalAmount')
        .addSelect('SUM(order.quantity)', 'totalQuantity')
        .groupBy('DATE(order.createdAt)')
        .orderBy('date', 'ASC');
      if (startDate && endDate) {
        query.andWhere('order.createdAt BETWEEN :start AND :end', {
          start: new Date(startDate),
          end: new Date(endDate),
        });
      }
      if (branchID) {
        query.andWhere('branch.id = :branchId', { branchId: branchID });
      }
      const result = await query.getRawMany();
      const costPrices = await Promise.all(
        result.map((item) => {
          const date = new Date(item.date);
          return {
            date: date.toLocaleDateString(),
            value: +item.totalCost,
            type: 'Chi phí',
          };
        }),
      );
      const orderSolds = await Promise.all(
        result.map((item) => {
          const date = new Date(item.date);
          return {
            date: date.toLocaleDateString(),
            value: Number(item.totalAmount),
            type: 'Doanh thu',
          };
        }),
      );

      const netProfit = await Promise.all(
        result.map((item) => {
          const date = new Date(item.date);
          return {
            date: date.toLocaleDateString(),
            value: Number(item.totalAmount) - +item.totalCost,
            type: 'Lợi nhuận ròng',
          };
        }),
      );
      const quantity = await Promise.all(
        result.map((item) => {
          const date = new Date(item.date);
          return {
            date: date.toLocaleDateString(),
            value: Number(item.totalQuantity),
            type: 'Số lượng',
          };
        }),
      );

      return [...costPrices, ...orderSolds, ...netProfit, ...quantity];
    } catch (error) {
      return error;
    }
  }

  async handleGetProductTrendings(
    page: number | string = 1,
    limit: number | string = 10,
    startDate: number,
    endDate: number,
  ) {
    const nowDate = new Date(startDate);
    const newDate = new Date(endDate);
    const findRawOrder =
      startDate && endDate
        ? await this.orderRepository
            .createQueryBuilder('orders')
            .where('orders.createdAt BETWEEN :start AND :end', {
              start: nowDate,
              end: newDate,
            })
            .leftJoin('orders.product', 'product')
            .select([
              'orders.id as id',
              'product.name as name',
              'product.slug as slug',
              'SUM(orders.quantity) as total',
            ])
            .groupBy('product.id')
            .orderBy('total', 'DESC')
            .limit(Number(limit))
            .getRawMany()
        : await this.orderRepository
            .createQueryBuilder('orders')
            .leftJoin('orders.product', 'product')
            .select([
              'orders.id as id',
              'product.name as name',
              'product.slug as slug',
              'SUM(orders.quantity) as total',
            ])
            .groupBy('product.id')
            .orderBy('total', 'DESC')
            .limit(Number(limit))
            .getRawMany();
    return await Promise.all(
      findRawOrder.map((_) => {
        return {
          ..._,
          total: Number(_.total),
        };
      }),
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
