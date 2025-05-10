import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

import { OrderPaymentStatusKey } from '../types/enum/status-payment.enum';

export class CreatePaymentDto {
  @IsIn(['cash', 'transfer'], {
    message: 'paymentMethod phải là "cash" hoặc "transfer"',
  })
  paymentMethod: 'cash' | 'transfer';

  @IsString()
  @IsNotEmpty({ message: 'receiver không được để trống' })
  receiver: string;

  @IsPhoneNumber('VN', {
    message: 'phone phải là số điện thoại hợp lệ của Việt Nam',
  })
  @IsNotEmpty({ message: 'phone không được để trống' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  note?: string;
}
