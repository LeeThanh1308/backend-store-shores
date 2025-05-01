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

export class ForgetAccountDto {
  @IsPhoneNumber('VN') // Hoặc bỏ nếu không muốn giới hạn quốc gia
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @Length(1, 50)
  @IsNotEmpty()
  email: string;
}
