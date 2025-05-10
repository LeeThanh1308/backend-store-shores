import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

import { CreatePaymentDto } from './create-payment.dto';
import { OrderPaymentStatusKey } from '../types/enum/status-payment.enum';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'])
  paymentStatus: OrderPaymentStatusKey;
}
