import { BaseModel } from 'src/common/entities/BaseEntity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('product_brands')
export class ProductBrand extends BaseModel {
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  logo?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
