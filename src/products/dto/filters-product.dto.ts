import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

export enum SortOrder {
  NEWEST = 'newest', // Sắp xếp mới nhất
  OLDEST = 'oldest', // Sắp xếp muộn nhất
  PRICE_ASC = 'price_asc', // Sắp xếp theo giá từ thấp đến cao
  PRICE_DESC = 'price_desc', // Sắp xếp theo giá từ cao đến thấp
}

export class PriceRangeDto {
  @IsNumber()
  @IsNotEmpty()
  min: number;

  @IsNumber()
  @IsNotEmpty()
  max: number;
}

export class UseFiltersDto {
  @IsArray()
  @IsOptional()
  colors: string[];

  @IsArray()
  @IsOptional()
  objects: string[];

  @IsArray()
  @IsOptional()
  brands: string[];

  @IsArray()
  @IsOptional()
  categories: string[];

  @IsOptional()
  @IsString()
  object: string;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  category: string;

  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PriceRangeDto)
  priceRange: PriceRangeDto;
}

export class FiltersProductDto {
  @IsString()
  @IsOptional()
  keyword: string;

  @IsInt()
  @IsOptional()
  page: number;

  @IsInt()
  @IsOptional()
  limit: number;

  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UseFiltersDto)
  @Transform(({ value }) => {
    console.log(value);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(UseFiltersDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  useFilters: UseFiltersDto;

  @IsOptional()
  @IsEnum(SortOrder, {
    message:
      'Sort order must be one of the following: newest, oldest, price_asc, price_desc',
  })
  sortOrder: SortOrder;
}
