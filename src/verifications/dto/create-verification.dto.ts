import {
  IsEmail,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { Accounts } from 'src/accounts/entities/account.entity';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Type } from 'class-transformer';

export class CreateVerificationDto {
  @IsEmail()
  @IsUnique(Accounts, 'email', 'id')
  email: string;

  @IsNumber()
  code: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateAccountDto)
  data?: CreateAccountDto;

  forget_password?: boolean;
}
