import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Product } from 'src/products/entities/product.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';

@Entity({ name: 'orders' })
export class Order extends BaseModel {
  @Column()
  description: string;

  @Column({ nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, nullable: false })
  totalAmount: number;

  @ManyToOne(() => Accounts, (accounts) => accounts.carts)
  @JoinColumn()
  account: Accounts;

  @ManyToOne(() => StoreItem, (storeItem) => storeItem.orders)
  storeItem: StoreItem;

  @ManyToOne(() => ProductSize, (productSize) => productSize.orders)
  @JoinColumn()
  size: ProductSize;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn()
  product: Product;
}
