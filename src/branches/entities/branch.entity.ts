import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Store } from 'src/stores/entities/store.entity';

@Entity('branches')
export class Branch extends BaseModel {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column('decimal', { precision: 9, scale: 6 }) // Lưu kinh độ
  longitude: number;

  @Column('decimal', { precision: 9, scale: 6 }) // Lưu vĩ độ
  latitude: number;

  @OneToMany(() => Store, (store) => store.branch)
  stores: Store[];

  @OneToMany(() => Accounts, (accounts) => accounts.staff, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  staffs?: Accounts;

  @OneToOne(() => Accounts, (accounts) => accounts.manage, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  manage?: Accounts | null;
}
