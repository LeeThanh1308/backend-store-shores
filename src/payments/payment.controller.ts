import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CartsService } from 'src/carts/carts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import { PaymentsService } from './payments.service';
import { Accounts } from 'src/accounts/entities/account.entity';
import { RequestWithUser } from 'src/common/types/request-with-user';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';
import { PaymentsGateway } from './payments.gateway';
import { OrderPaymentStatus } from './types/enum/status-payment.enum';
import { CreatePaymentCashierDto } from './dto/create-payment.cashier';
@Controller('payment')
export class PaymentsController {
  constructor(
    private readonly paymentsGateway: PaymentsGateway,
    private readonly paymentService: PaymentsService,
    private readonly cartService: CartsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async onCreatedDataPayment(
    @Req() req: RequestWithUser | any,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const user = req.user;
    const ipAddr =
      req?.headers['x-forwarded-for'] ||
      req?.connection?.remoteAddress ||
      req?.socket?.remoteAddress ||
      req?.connection?.socket?.remoteAddress;
    const data = await this.paymentService.handleCreateDataPayment(
      user.id,
      createPaymentDto,
      ipAddr,
    );
    this.paymentsGateway.server.emit('onCreatePayment', data);
    return data;
  }

  @Post('cashier')
  @UseGuards(AuthGuard)
  async onCreatedDataPaymentCashier(
    @Req() req: RequestWithUser | any,
    @Body() createPaymentDto: CreatePaymentCashierDto,
  ) {
    const user = req.user;
    const data = await this.paymentService.handleCreatedDataPaymentCashier(
      user.id,
      createPaymentDto,
    );
    this.paymentsGateway.server.emit('onCreatePayment', data);
    return data;
  }

  @Get('vnpay_return')
  async onGetVnpayReturn(
    @Req() req: any,
    @Query('vnp_SecureHash') secureHash: string,
  ) {
    try {
      const vnp_Params = req.query;
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];
      const { status, message } =
        await this.paymentService.handleGetVnpayReturn(vnp_Params, secureHash);
    } catch (e) {
      throw new HttpException(
        e || 'Có lỗi xảy ra xin vui lòng thử lại sau.',
        e.status || 400,
      );
    }
  }

  @Get('product-status')
  async onGetProductStatus() {
    return OrderPaymentStatus;
  }

  @Get('orders')
  @UseGuards(AuthGuard)
  async onGetMyOrders(@Req() req: RequestWithUser) {
    const user = req.user;
    return await this.paymentService.handleGetMyOrders(user);
  }

  @Get('admin/orders')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER, EnumRoles.STAFF])
  async onGetOrdersAdmin(@Query('filter') filter: string) {
    return await this.paymentService.handleGetOrdersAdmin(filter);
  }
  @Patch('admin/orders')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER, EnumRoles.STAFF])
  async onUpdatedOrdersAdmin(@Body() updatePaymentDto: UpdatePaymentDto) {
    return await this.paymentService.handleUpdatedOrdersAdmin(updatePaymentDto);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
