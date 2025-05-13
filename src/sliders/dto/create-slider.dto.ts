import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { IsUnique } from 'src/common/validators/unique.validator';
import { Slider } from '../entities/slider.entity';
import { Transform } from 'class-transformer';

export class CreateSliderDto {
  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  @IsUnique(Slider, 'name', 'id')
  name: string;

  @IsString()
  @Length(1, 500)
  @IsNotEmpty()
  @IsUnique(Slider, 'slug', 'id')
  slug: string;

  @IsString()
  @IsOptional()
  href: string;
}
