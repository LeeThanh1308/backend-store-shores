import {
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { IsUnique } from 'src/common/validators/unique.validator';
import { ProductBrand } from '../entities/product-brand.entity';

export class CreateProductBrandDto {
  @IsString()
  @IsNotEmpty()
  @IsUnique(ProductBrand, 'name')
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUnique(ProductBrand, 'slug')
  slug: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
