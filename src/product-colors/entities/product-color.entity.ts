import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

import { BaseModel } from 'src/common/entities/BaseEntity';
import { Cart } from 'src/carts/entities/cart.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';

@Entity('product_colors')
export class ProductColor extends BaseModel {
  @Column()
  name: string;

  @Column({ type: 'varchar', length: 7 })
  hexCode: string;

  @OneToMany(() => ProductImage, (image) => image.color, {
    onDelete: 'CASCADE',
  })
  images: ProductImage[];

  @OneToMany(() => Cart, (cart) => cart.color)
  carts: Cart[];

  @OneToMany(() => StoreItem, (storeItem) => storeItem.color, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items: StoreItem[];

  @OneToMany(() => Order, (order) => order.color)
  orders: Order[];

  @ManyToMany(() => Product, (product) => product.colors, {
    onDelete: 'CASCADE',
  })
  products: Product[];
}
