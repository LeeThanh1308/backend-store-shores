import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCartDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  sizeID: number;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  colorID: number;
}
