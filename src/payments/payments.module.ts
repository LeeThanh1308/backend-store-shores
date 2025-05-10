import { CartsModule } from 'src/carts/carts.module';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payment.controller';
import { PaymentsGateway } from './payments.gateway';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), CartsModule, JwtModule],
  providers: [PaymentsGateway, PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
