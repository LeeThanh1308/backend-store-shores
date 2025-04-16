import { Verifications } from 'src/verifications/entities/verification.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class DataVerify {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  fullname: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, type: 'enum', enum: ['x', 'y', 'z'] })
  gender: string;

  @Column({ nullable: false, unique: true })
  phone: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, type: 'date' })
  birthday: Date;

  @OneToOne(() => Verifications, (verification) => verification.data, { onDelete: 'CASCADE' })
  @JoinColumn()
  verification: Verifications;
}
