import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { CreateStoreItemDto } from 'src/store-items/dto/create-store-item.dto';

export class CreateStoreDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsInt()
  @IsNotEmpty()
  branchID: number;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1) // 👈 yêu cầu phải có ít nhất 1 phần tử trong mảng
  @ValidateNested({ each: true })
  @Type(() => CreateStoreItemDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(CreateStoreItemDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  items: CreateStoreItemDto[];
}
