import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateStoreItemDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @Min(0)
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  productID: number;

  @IsNumber()
  @IsNotEmpty()
  sizeID: number;

  @IsNumber()
  @IsOptional()
  colorID: number;
}
