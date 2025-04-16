import { IsString, IsNumber } from 'class-validator';

export class CreateProductImageDto {
  @IsString()
  src: string;

  @IsNumber()
  productId: number;
}
