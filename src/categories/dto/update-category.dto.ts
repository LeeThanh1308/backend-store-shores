import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['name', 'slug'] as const),
) {
  @IsString()
  @Length(1, 255)
  @IsOptional()
  name: string;

  @IsString()
  @Length(1, 500)
  @IsOptional()
  slug: string;
}
