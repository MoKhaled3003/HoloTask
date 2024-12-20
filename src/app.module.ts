// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';
import { VoucherModule } from './voucher/voucher.module';
import { SpecialOfferModule } from './special-offer/special-offer.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'voucher_pool',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CustomerModule,
    VoucherModule,
    SpecialOfferModule,
  ],
})
export class AppModule {}
