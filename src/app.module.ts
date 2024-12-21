import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';
import { VoucherModule } from './voucher/voucher.module';
import { SpecialOfferModule } from './special-offer/special-offer.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule if you're using @nestjs/config
      inject: [ConfigService], // Inject ConfigService to access configuration
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres', // as an example
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: ['dist/**/*.entity.js'],
        synchronize: true, // should be true only for dev environment
        // Other TypeORM configuration options...
      }),
    }),
    CustomerModule,
    VoucherModule,
    SpecialOfferModule,
  ],
})
export class AppModule {}
