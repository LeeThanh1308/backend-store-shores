import { Column, Entity } from 'typeorm';

import { BaseModel } from 'src/common/entities/BaseEntity';

@Entity('sliders')
export class Slider extends BaseModel {
  @Column({ type: 'varchar', length: 255, unique: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: false })
  src: string;

  @Column({ nullable: true })
  href: string;
}
