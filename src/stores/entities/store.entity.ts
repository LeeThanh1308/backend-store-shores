import { Entity, ManyToOne, OneToMany } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Branch } from 'src/branches/entities/branch.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';

@Entity('stores')
export class Store extends BaseModel {
  @OneToMany(() => StoreItem, (item) => item.store)
  items: StoreItem[];

  @ManyToOne(() => Accounts, (account) => account.stockIn)
  createdBy: Accounts;

  @ManyToOne(() => Branch, (branch) => branch.stores)
  branch: Branch;
}
