import { Injectable } from '@nestjs/common';
import { CreateTempOrderDto } from './dto/create-temp-order.dto';
import { UpdateTempOrderDto } from './dto/update-temp-order.dto';

@Injectable()
export class TempOrdersService {
  create(createTempOrderDto: CreateTempOrderDto) {
    return 'This action adds a new tempOrder';
  }

  findAll() {
    return `This action returns all tempOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tempOrder`;
  }

  update(id: number, updateTempOrderDto: UpdateTempOrderDto) {
    return `This action updates a #${id} tempOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} tempOrder`;
  }
}
