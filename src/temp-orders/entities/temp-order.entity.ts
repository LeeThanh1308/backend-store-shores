import { Entity, ManyToOne } from 'typeorm';

import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity('temp-orders')
export class TempOrder extends Order {
  @ManyToOne(() => Payment, (payment) => payment.tempOrders, {
    onDelete: 'CASCADE',
  })
  payment: Payment;
}
