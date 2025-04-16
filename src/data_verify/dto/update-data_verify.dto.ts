import { PartialType } from '@nestjs/mapped-types';
import { CreateDataVerifyDto } from './create-data_verify.dto';

export class UpdateDataVerifyDto extends PartialType(CreateDataVerifyDto) {}
