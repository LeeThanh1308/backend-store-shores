import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseModel } from 'src/common/entities/BaseEntity';
import { Product } from 'src/products/entities/product.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { Store } from 'src/stores/entities/store.entity';

@Entity('store-items')
export class StoreItem extends BaseModel {
  @Column({ type: 'int', nullable: false })
  quantity: number;

  @ManyToOne(() => Store, (store) => store.items)
  store: Store;

  @ManyToOne(() => Product, (product) => product.stores)
  product: Product;

  @ManyToOne(() => ProductSize, (productSize) => productSize.stores)
  size: ProductSize;
}
