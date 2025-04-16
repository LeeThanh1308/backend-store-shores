import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductBrandDto } from './create-product-brand.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductBrandDto extends PartialType(
  OmitType(CreateProductBrandDto, ['name', 'slug'] as const),
) {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}
