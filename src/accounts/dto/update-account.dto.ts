import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(
  OmitType(CreateAccountDto, ['password'] as const),
) {
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  avatar?: string;

  ban?: boolean;

  role_id?: number;

  refresh_token?: string;

  rolesID?: string[];
}
