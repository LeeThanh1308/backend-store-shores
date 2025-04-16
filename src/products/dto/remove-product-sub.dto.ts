import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RemoveProductSub {
  @IsOptional()
  @IsArray({ message: 'images must be an array' })
  @IsInt({ each: true, message: 'Each image must be an integer (id)' })
  images: number[];

  @IsOptional()
  @IsArray({ message: 'images must be an array' })
  @IsInt({ each: true, message: 'Each image must be an integer (id)' })
  colors: number[];

  @IsOptional()
  @IsArray({ message: 'images must be an array' })
  @IsInt({ each: true, message: 'Each image must be an integer (id)' })
  sizes: number[];
}
