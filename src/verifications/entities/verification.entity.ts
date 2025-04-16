import { Max, Min } from 'class-validator';
import { DataVerify } from 'src/data_verify/entities/data_verify.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';

@Entity({ name: 'verification_codes' })
export class Verifications {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  code: number;

  @Column({ default: 3 })
  @Min(0)
  @Max(3)
  total_verify: number;

  @Column({ default: false })
  forget_password: boolean;

  @Column({ default: false })
  isSuccess: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => DataVerify, (dataVerify) => dataVerify.verification, { onDelete: 'CASCADE' })
  data: DataVerify;
}
