import { BaseModel } from 'src/common/entities/BaseEntity';
import { Store } from 'src/stores/entities/store.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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
}
