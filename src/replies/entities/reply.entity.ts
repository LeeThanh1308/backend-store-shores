import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';

@Entity('replies')
export class Reply extends BaseModel {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Accounts, (account) => account.replies, {
    onDelete: 'CASCADE',
  })
  account: Accounts;

  @ManyToOne(() => Accounts, (account) => account.accountReplys, {
    onDelete: 'CASCADE',
  })
  accountReply: Accounts;

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  comment: Comment;
}
