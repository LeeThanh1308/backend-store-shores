import { PartialType } from '@nestjs/mapped-types';
import { CreateTempOrderDto } from './create-temp-order.dto';

export class UpdateTempOrderDto extends PartialType(CreateTempOrderDto) {}
