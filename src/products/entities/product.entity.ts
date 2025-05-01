import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseModel } from 'src/common/entities/BaseEntity';
import { Category } from 'src/categories/entities/category.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductBrand } from 'src/product-brands/entities/product-brand.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { Store } from 'src/stores/entities/store.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';
import { TargetGroup } from 'src/target-groups/entities/target-group.entity';

@Entity('products')
export class Product extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ nullable: false })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, nullable: false })
  costPrice: number; // Giá cho size này

  @Column({ type: 'decimal', precision: 12, nullable: false })
  sellingPrice: number; // Giá cho size này

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => StoreItem, (store) => store.product)
  items: StoreItem[];

  @OneToMany(() => Comment, (comment) => comment.product, {
    cascade: true, // 👈 Quan trọng nếu bạn muốn tạo luôn hình ảnh khi tạo product
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => ProductSize, (productSize) => productSize.product, {
    cascade: true, // 👈 Quan trọng nếu bạn muốn tạo luôn hình ảnh khi tạo product
    onDelete: 'CASCADE',
  })
  sizes: ProductSize[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true, // 👈 Quan trọng nếu bạn muốn tạo luôn hình ảnh khi tạo product
    onDelete: 'CASCADE',
  })
  images: ProductImage[];

  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];

  @ManyToOne(() => ProductBrand, (productBrand) => productBrand.products)
  brand: ProductBrand;

  @ManyToOne(() => TargetGroup, (targetGroup) => targetGroup.products)
  targetGroup: TargetGroup;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToMany(() => ProductColor, (colors) => colors.products)
  @JoinTable()
  colors: ProductColor[];
}
