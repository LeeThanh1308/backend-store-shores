import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: ['R1', 'R2', 'R3'],
    select: false,
  })
  role: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false, select: false })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Accounts, (accounts) => accounts.roles)
  accounts: Accounts;
}
