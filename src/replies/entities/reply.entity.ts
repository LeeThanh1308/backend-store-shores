import { Comment } from 'src/comments/entities/comment.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';

@Entity('replies')
export class Reply extends BaseModel {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  comment: Comment;
}
