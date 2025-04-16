import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity('likes')
export class Like extends BaseModel {
  @ManyToMany(() => Comment, (comment) => comment.likes)
  @JoinTable()
  comments: Comment[];

  @ManyToOne(() => Accounts, (account) => account.likes)
  account: Accounts[];
}
