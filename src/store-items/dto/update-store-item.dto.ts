import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { CreateStoreItemDto } from './create-store-item.dto';
import { PartialType } from '@nestjs/mapped-types';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { UpdateProductSizeDto } from 'src/product-sizes/dto/update-product-size.dto';

export class UpdateStoreItemDto extends PartialType(CreateStoreItemDto) {
  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    console.log(value);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(UpdateProductDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  product: UpdateProductDto;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    console.log(value);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(UpdateProductSizeDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  size: UpdateProductSizeDto;
}
