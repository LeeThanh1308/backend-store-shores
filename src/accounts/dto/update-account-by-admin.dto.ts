import { IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountByAdmin extends PartialType(
  OmitType(CreateAccountDto, ['phone', 'email', 'password'] as const),
) {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  fullname: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsPhoneNumber('VN') // Hoặc bỏ nếu không muốn giới hạn quốc gia
  @IsOptional()
  phone: string;
}
