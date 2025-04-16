import { IsString, IsNumber } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;
}
