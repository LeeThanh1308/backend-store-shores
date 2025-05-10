import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';

@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Accounts, (accounts) => accounts.carts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  account: Accounts;

  @ManyToOne(() => ProductSize, (productSize) => productSize.carts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  size: ProductSize;

  @ManyToOne(() => ProductColor, (color) => color.carts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  color: ProductColor;
}
