import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateAccountDto } from './create-account.dto';

export class UpdateMyAccountDto extends PartialType(
  OmitType(CreateAccountDto, [
    'password',
    'email',
    'phone',
    'ban',
    'refresh_token',
  ] as const),
) {}
