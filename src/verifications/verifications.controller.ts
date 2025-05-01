import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { Response } from 'express';

@Controller('verifications')
export class VerificationsController {
  constructor(private readonly verificationsService: VerificationsService) {}

  // @Post()
  // create(@Body() createVerificationDto: CreateVerificationDto) {
  //   return this.verificationsService.create(createVerificationDto);
  // }

  @Post('accounts/:id/:code')
  async onVerify(
    @Param('id') id: string,
    @Param('code') code: number,
    @Body() password?: { password?: string },
  ) {
    try {
      if (password?.password) {
        return await this.verificationsService.handleVerifyEmail(
          +id,
          +code,
          password?.password,
        );
      } else {
        return await this.verificationsService.handleVerifyEmail(id, code);
      }
    } catch (err) {
      throw new NotFoundException({ message: 'Xác minh tài khoản thất bại!' });
    }
  }

  @Get('refresh/:id')
  async onRefresh(@Param('id') id: string) {
    try {
      return await this.verificationsService.handleRefreshCode(+id);
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          message: e
            ? 'Có lỗi sảy ra xin vui lòng thử lại sau.'
            : 'TokenID đã hết hạn vui lòng đăng ký lại.!',
        },
        404,
      );
    }
  }

  @Get('checkVerify/:id')
  async onCheckRefreshCode(@Param('id') id: string) {
    try {
      return await this.verificationsService.handleCheckRefreshCode(+id);
    } catch (error) {
      throw new NotFoundException({
        message: 'TokenID đã hết hạn vui lòng đăng ký lại.!',
        error,
      });
    }
  }
}
