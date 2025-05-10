import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';

@Entity({ name: 'blogs' })
export class Blog extends BaseModel {
  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Accounts, (account) => account.blogs, {
    onDelete: 'CASCADE',
  })
  account: Accounts;

  @OneToMany(() => Comment, (comment) => comment.blog)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.blog)
  likes: Like[];
}
