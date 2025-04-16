import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseModel } from 'src/common/entities/BaseEntity';
import { Product } from 'src/products/entities/product.entity';
import { Store } from 'src/stores/entities/store.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';

@Entity('product_sizes')
export class ProductSize extends BaseModel {
  @Column({ type: 'decimal', precision: 12 })
  costPrice: number; // Giá cho size này

  @Column({ type: 'decimal', precision: 12 })
  sellingPrice: number; // Giá cho size này

  @Column()
  type: string;

  @Column({ type: 'int' })
  discount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Product, (Product) => Product.sizes, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => StoreItem, (StoreItem) => StoreItem.size)
  stores: StoreItem[];
}
