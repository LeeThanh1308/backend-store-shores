import { IsString, IsInt } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  content: string;

  @IsInt()
  commentId: number;
}
