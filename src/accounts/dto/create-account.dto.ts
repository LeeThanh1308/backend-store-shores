import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';

import { Accounts } from '../entities/account.entity';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsEnum(['x', 'y', 'z'])
  @IsNotEmpty()
  gender: string;

  @IsPhoneNumber('VN') // Hoặc bỏ nếu không muốn giới hạn quốc gia
  @IsNotEmpty()
  @IsUnique(Accounts, 'phone', 'id')
  phone: string;

  @IsDateString()
  birthday: Date;

  @IsEmail()
  @Length(1, 50)
  @IsNotEmpty()
  @IsUnique(Accounts, 'email', 'id')
  email: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  ban?: boolean;

  @IsOptional()
  @IsString()
  refresh_token?: string;
}
