import { IsDateString, IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  fullname: string;

  @IsNotEmpty()
  password: string;

  @IsDateString()
  birthday: Date;

  @IsNotEmpty()
  gender: string;

  @IsPhoneNumber('VN')
  phone: string;

  @IsEmail()
  email: string;

  roles?: any;

  usid?: string;
}
