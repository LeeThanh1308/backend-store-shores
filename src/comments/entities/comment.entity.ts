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
import { Blog } from 'src/blogs/entities/blog.entity';
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

  @ManyToOne(() => Blog, (blog) => blog.comments, {
    onDelete: 'CASCADE',
  })
  @Index()
  blog: Product;

  @ManyToOne(() => Accounts, (account) => account.comments, {
    onDelete: 'CASCADE',
  })
  account: Accounts;

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];

  @OneToMany(() => Reply, (reply) => reply.comment)
  replies: Reply[];
}
