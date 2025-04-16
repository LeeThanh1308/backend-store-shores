import { Injectable } from '@nestjs/common';
import { CreateDataVerifyDto } from './dto/create-data_verify.dto';
import { UpdateDataVerifyDto } from './dto/update-data_verify.dto';

@Injectable()
export class DataVerifyService {
  create(createDataVerifyDto: CreateDataVerifyDto) {
    return 'This action adds a new dataVerify';
  }

  findAll() {
    return `This action returns all dataVerify`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dataVerify`;
  }

  update(id: number, updateDataVerifyDto: UpdateDataVerifyDto) {
    return `This action updates a #${id} dataVerify`;
  }

  remove(id: number) {
    return `This action removes a #${id} dataVerify`;
  }
}
