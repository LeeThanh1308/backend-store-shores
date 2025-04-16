import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { CreateProductColorDto } from './create-product-color.dto';
import { CreateProductSizeDto } from './create-product-size.dto';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Product } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsUnique(Product, 'name')
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUnique(Product, 'slug')
  slug: string;

  @IsString()
  @IsNotEmpty()
  @IsUnique(Product, 'barcode')
  barcode: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  costPrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  sellingPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  brandID: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  targetGroupID: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  categoryID: number;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1) // 👈 yêu cầu phải có ít nhất 1 phần tử trong mảng
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(CreateProductColorDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  colors: CreateProductColorDto[];

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1) // 👈 yêu cầu phải có ít nhất 1 phần tử trong mảng
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(CreateProductSizeDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  sizes: CreateProductSizeDto[];
}
