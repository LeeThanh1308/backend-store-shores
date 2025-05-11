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

import { Blog } from 'src/blogs/entities/blog.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Reply } from 'src/replies/entities/reply.entity';
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

  @Column({ nullable: true, type: 'text', select: false })
  refresh_token?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Roles, (roles) => roles.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  roles: Roles | null;

  @OneToMany(() => Store, (store) => store.createdBy)
  stockIn: Store[];

  @OneToMany(() => Like, (like) => like.account)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.account)
  comments: Comment[];

  @OneToMany(() => Reply, (reply) => reply.account)
  replies: Reply[];

  @OneToMany(() => Reply, (reply) => reply.accountReply)
  accountReplys: Reply[];

  @OneToMany(() => Cart, (cart) => cart.account)
  carts: Cart[];

  @OneToMany(() => Cart, (cart) => cart.cashier)
  cashierCarts: Cart[];

  @OneToMany(() => Order, (order) => order.account)
  orders: Order[];

  @OneToMany(() => Order, (order) => order.staff)
  orderStaffs: Order[];

  @OneToMany(() => Blog, (blog) => blog.account)
  blogs: Blog[];

  @OneToMany(() => Payment, (payment) => payment.account)
  payments: Payment[];

  @OneToMany(() => Payment, (payment) => payment.staff)
  staffPayments: Payment[];

  @ManyToOne(() => Branch, (branch) => branch.staffs)
  staff: Branch | null;

  @OneToOne(() => Branch, (branch) => branch.manage)
  manage: Branch | null;
}
