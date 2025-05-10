import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@WebSocketGateway()
export class PaymentsGateway {
  constructor(private readonly paymentsService: PaymentsService) {}

  @SubscribeMessage('createPayment')
  create(@MessageBody() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @SubscribeMessage('findAllPayments')
  findAll() {
    return this.paymentsService.findAll();
  }

  @SubscribeMessage('findOnePayment')
  findOne(@MessageBody() id: number) {
    return this.paymentsService.findOne(id);
  }

  @SubscribeMessage('updatePayment')
  update(@MessageBody() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(updatePaymentDto.id, updatePaymentDto);
  }

  @SubscribeMessage('removePayment')
  remove(@MessageBody() id: number) {
    return this.paymentsService.remove(id);
  }
}
