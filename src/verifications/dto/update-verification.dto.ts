import { IsInt, IsOptional } from 'class-validator';

import { CreateVerificationDto } from './create-verification.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateVerificationDto extends PartialType(CreateVerificationDto) {
  @IsInt()
  @IsOptional()
  id: number;
}
