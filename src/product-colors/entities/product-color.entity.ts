import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

import { BaseModel } from 'src/common/entities/BaseEntity';
import { Product } from 'src/products/entities/product.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';

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

  @ManyToMany(() => Product, (product) => product.colors, {
    onDelete: 'CASCADE',
  })
  products: Product[];
}
