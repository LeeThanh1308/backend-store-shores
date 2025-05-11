import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';

@Entity({ name: 'orders' })
export class Order extends BaseModel {
  @Column()
  name: string;

  @Column({ nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, nullable: false })
  totalAmount: number;

  @ManyToOne(() => Accounts, (accounts) => accounts.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  account: Accounts;

  @ManyToOne(() => Accounts, (accounts) => accounts.orderStaffs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  staff: Accounts;

  @ManyToOne(() => StoreItem, (storeItem) => storeItem.orders, {
    onDelete: 'CASCADE',
  })
  storeItem: StoreItem;

  @ManyToOne(() => ProductSize, (productSize) => productSize.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  size: ProductSize;

  @ManyToOne(() => ProductColor, (color) => color.orders, {
    onDelete: 'CASCADE',
  })
  color: ProductColor;

  @ManyToOne(() => Product, (product) => product.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;

  @ManyToOne(() => Payment, (payment) => payment.orders, {
    onDelete: 'CASCADE',
  })
  payment: Payment;
}
