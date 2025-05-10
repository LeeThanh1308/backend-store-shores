import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  content: string;

  @IsInt()
  @IsOptional()
  commentID: number;

  @IsString()
  @IsOptional()
  accountReplyID: string;
}
