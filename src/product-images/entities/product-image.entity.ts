import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from 'src/products/entities/product.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  src: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => ProductColor, (colors) => colors.images, {
    onDelete: 'CASCADE',
  })
  color: ProductColor;
}
