import { IsNumber, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';

export class CreateLikeDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  commentID?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  replyID?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  blogID?: number;
}
