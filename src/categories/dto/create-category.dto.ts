import {
  IsString,
  IsOptional,
  Length,
  IsBoolean,
  Validate,
} from 'class-validator';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Category } from '../entities/category.entity';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 255)
  @IsUnique(Category, 'name')
  name: string;

  @IsString()
  @Length(1, 500)
  @IsUnique(Category, 'slug')
  slug: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  parentId?: number;
}
