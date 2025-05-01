import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { CreateStoreDto } from './create-store.dto';
import { UpdateStoreItemDto } from 'src/store-items/dto/update-store-item.dto';

export class UpdateStoreDto extends OmitType(CreateStoreDto, [
  'branchID',
  'items',
] as const) {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1) // 👈 yêu cầu phải có ít nhất 1 phần tử trong mảng
  @ValidateNested({ each: true })
  @Type(() => UpdateStoreItemDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(UpdateStoreItemDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  items: UpdateStoreItemDto[];
}
