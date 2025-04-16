import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

import { Product } from 'src/products/entities/product.entity';

@Entity('categories')
@Tree('closure-table', {
  closureTableName: 'category_closure',
  ancestorColumnName: (column) => 'ancestor_' + column.propertyName,
  descendantColumnName: (column) => 'descendant_' + column.propertyName,
})
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: true })
  icon?: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @TreeChildren({ cascade: true })
  children: Category[];

  @TreeParent({ onDelete: 'CASCADE' })
  @Index()
  parent: Category;

  @OneToMany(() => Product, (product) => product.category, {
    onDelete: 'CASCADE',
  })
  products: Product[];
}
