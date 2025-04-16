import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsInt()
  score?: number;

  @IsString()
  content: string;

  @IsInt()
  productId: number;

  @IsInt()
  accountId: number;
}
