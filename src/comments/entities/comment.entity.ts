import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Like } from 'src/likes/entities/like.entity';
import { Product } from 'src/products/entities/product.entity';
import { Reply } from 'src/replies/entities/reply.entity';

@Entity('comments')
export class Comment extends BaseModel {
  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Product, (product) => product.comments, {
    onDelete: 'CASCADE',
  })
  @Index()
  product: Product;

  @OneToMany(() => Reply, (reply) => reply.comment, { cascade: true })
  replies: Reply[];

  @ManyToOne(() => Accounts, (account) => account.comments)
  account: Accounts;

  @ManyToMany(() => Like, (like) => like.comments)
  @JoinTable()
  likes: Like;
}
