// src/voucher/voucher.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { CustomerModule } from '../customer/customer.module';
import { SpecialOffer } from '../special-offer/special-offer.entity';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, SpecialOffer]), CustomerModule],
  providers: [
    VoucherService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [VoucherController],
})
export class VoucherModule {}
