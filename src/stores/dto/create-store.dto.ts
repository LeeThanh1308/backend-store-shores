import { IsInt, Min, IsDateString, IsArray } from 'class-validator';

export class CreateStoreDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsDateString()
  receivedDate: string;

  @IsInt()
  createdById: number;

  @IsInt()
  branchId: number;

  @IsArray()
  sizes: number[];
}
