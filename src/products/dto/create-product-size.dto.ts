import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class CreateProductSizeDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsInt()
  @Min(0)
  @Max(100)
  discount: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
