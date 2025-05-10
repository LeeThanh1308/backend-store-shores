import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsInt()
  score?: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  content: string;

  @IsInt()
  @IsOptional()
  productID: number;

  @IsInt()
  @IsOptional()
  blogID: number;
}
