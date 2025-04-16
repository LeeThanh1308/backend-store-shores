import { IsString, Length } from 'class-validator';

export class CreateTargetGroupDto {
  @IsString()
  @Length(1, 255)
  name: string;
}
