import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { CreateSliderDto } from './create-slider.dto';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class UpdateSliderDto extends PartialType(CreateSliderDto) {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id: number;

  @IsString()
  @IsOptional()
  src: string;
}
