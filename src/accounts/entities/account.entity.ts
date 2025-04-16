import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Roles } from 'src/roles/entities/role.entity';
import { Store } from 'src/stores/entities/store.entity';

@Entity({ name: 'accounts' })
export class Accounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  fullname: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ nullable: false, type: 'enum', enum: ['x', 'y', 'z'] })
  gender: string;

  @Column({ nullable: false, unique: true })
  phone: string;

  @Column({ nullable: false, type: 'date' })
  birthday: Date;

  @Column({ length: 50, unique: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  ban: boolean;

  @Column({ nullable: false, unique: true })
  usid: string;

  @Column({ nullable: true, type: 'text' })
  refresh_token?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Roles, (roles) => roles.accounts)
  @JoinColumn()
  roles: Roles;

  // @OneToOne(() => Premises, (premises) => premises.manage)
  // @JoinColumn()
  // premise: Premises;

  // @ManyToOne(() => Premises, (premises) => premises.staff)
  // @JoinColumn()
  // premises: Premises[];

  @OneToMany(() => Store, (store) => store.createdBy)
  stockIn: Store[];

  @OneToMany(() => Like, (like) => like.account)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.account)
  comments: Comment[];
}
