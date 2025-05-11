import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UseGuards } from '@nestjs/common';
import { AuthSocketGuard } from 'src/guards/authSocket.guard';
import { Server } from 'socket.io';

@WebSocketGateway()
export class PaymentsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly paymentsService: PaymentsService) {}

  @SubscribeMessage('handleCreatePayment')
  @UseGuards(AuthSocketGuard)
  create(
    @MessageBody() createPaymentDto: CreatePaymentDto,
    @ConnectedSocket() client: any,
  ) {
    console.log('true');
    this.server.emit('onCreatePayment', createPaymentDto);
    return createPaymentDto;
    return this.paymentsService.create(createPaymentDto);
  }

  @SubscribeMessage('joinBranchRoom')
  @UseGuards(AuthSocketGuard)
  onJoinBranch(
    @MessageBody() data: { id: number },
    @ConnectedSocket() client: any,
  ) {
    client.join(`branch-${data.id}`);
    client.emit('joinedRoom', { room: `branch-${data.id}` });
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
