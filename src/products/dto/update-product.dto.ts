import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { CreateProductColorDto } from './create-product-color.dto';
import { CreateProductDto } from './create-product.dto';
import { CreateProductSizeDto } from './create-product-size.dto';
import { RemoveProductSub } from './remove-product-sub.dto';
import { UpdateProductColorDto } from './update-product-color.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'name',
    'slug',
    'barcode',
    'colors',
    'sizes',
  ] as const),
) {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  barcode: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductColorDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(UpdateProductColorDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  colors: CreateProductColorDto[];

  @IsOptional()
  @IsArray()
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

  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RemoveProductSub)
  @Transform(({ value }) => {
    console.log(value);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(RemoveProductSub, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  removes: RemoveProductSub;
}
