import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginAccountDto {
  @IsNotEmpty()
  emailAndPhone: string;

  @IsNotEmpty()
  password: string;
}
