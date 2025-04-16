import { BaseModel } from 'src/common/entities/BaseEntity';
import { Product } from 'src/products/entities/product.entity';
import { Column, OneToMany, Entity } from 'typeorm';

@Entity('target_groups')
export class TargetGroup extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => Product, (product) => product.targetGroup)
  products: Product[];
}
