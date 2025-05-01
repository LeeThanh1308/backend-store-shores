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
} from 'class-validator';

import { Accounts } from 'src/accounts/entities/account.entity';
import { IsUnique } from 'src/common/validators/unique.validator';

export class CreateDataVerifyDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['x', 'y', 'z'])
  @IsNotEmpty()
  gender: string;

  @IsPhoneNumber('VN') // Hoặc bỏ nếu không muốn giới hạn quốc gia
  @IsNotEmpty()
  @IsUnique(Accounts, 'phone')
  phone: string;

  @IsDateString()
  birthday: Date;

  @IsEmail()
  @Length(1, 50)
  @IsNotEmpty()
  @IsUnique(Accounts, 'email')
  email: string;
}
