// src/voucher/voucher.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';

@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('create')
  async createVoucher(
    @Body()
    body: {
      customerId: number;
      specialOfferId: number;
      expirationDate: string;
    },
  ) {
    const voucher = await this.voucherService.createVoucher(
      body.customerId,
      body.specialOfferId,
      body.expirationDate,
    );
    return { message: 'Voucher created successfully', voucher };
  }

  @Post('generate')
  async generateVouchers(
    @Body() body: { specialOfferId: number; expirationDate: string },
  ) {
    const vouchers = await this.voucherService.generateVouchers(
      body.specialOfferId,
      body.expirationDate,
    );
    return { message: 'Vouchers generated successfully', vouchers };
  }

  @Post('redeem')
  async redeemVoucher(@Body() body: { voucherCode: string; email: string }) {
    try {
      const result = await this.voucherService.redeemVoucher(
        body.voucherCode,
        body.email,
      );
      return {
        message: 'Voucher redeemed successfully',
        discount: result.discountPercentage,
      };
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async getCustomerVouchers(@Query('email') email: string) {
    return await this.voucherService.getCustomerVouchers(email);
  }
}
