// src/voucher/voucher.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherModule } from './voucher.module';
import { Customer } from '../customer/customer.entity';
import { SpecialOffer } from '../special-offer/special-offer.entity';
import { Voucher } from './voucher.entity';
import { DataSource } from 'typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import * as dotenv from 'dotenv';

describe('VoucherModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dotenv.config();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.DATABASE_NAME || 'voucher_pool',
          entities: [Customer, SpecialOffer, Voucher],
          synchronize: true,
        }),
        VoucherModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/vouchers/create (POST)', () => {
    it('should create a new voucher', async () => {
      const customer = await dataSource.getRepository(Customer).save({
        name: 'John Doe',
        email: 'john.doe@example.com',
      });

      const specialOffer = await dataSource.getRepository(SpecialOffer).save({
        name: 'Black Friday Sale',
        discountPercentage: 20,
      });

      const response = await request(app.getHttpServer())
        .post('/vouchers/create')
        .send({
          customerId: customer.id,
          specialOfferId: specialOffer.id,
          expirationDate: '2025-12-31',
        })
        .expect(201);

      expect(response.body.message).toEqual('Voucher created successfully');
    });
  });

  describe('/vouchers/generate (POST)', () => {
    it('should generate vouchers for all customers', async () => {
      await dataSource.getRepository(Customer).save({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      });

      const specialOffer = await dataSource.getRepository(SpecialOffer).save({
        name: 'Cyber Monday Deal',
        discountPercentage: 25,
      });

      const response = await request(app.getHttpServer())
        .post('/vouchers/generate')
        .send({
          specialOfferId: specialOffer.id,
          expirationDate: '2025-12-31',
        })
        .expect(201);

      expect(response.body.message).toEqual('Vouchers generated successfully');
      expect(response.body.vouchers).toHaveLength(2);
    });
  });

  describe('/vouchers/redeem (POST)', () => {
    it('should redeem a voucher', async () => {
      const customer = await dataSource.getRepository(Customer).save({
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
      });

      const specialOffer = await dataSource.getRepository(SpecialOffer).save({
        name: 'Holiday Discount',
        discountPercentage: 15,
      });

      const voucher = await dataSource.getRepository(Voucher).save({
        code: 'HOLIDAY123',
        expirationDate: '2025-12-31',
        isUsed: false,
        customer,
        specialOffer,
      });

      const response = await request(app.getHttpServer())
        .post('/vouchers/redeem')
        .send({
          voucherCode: voucher.code,
          email: customer.email,
        })
        .expect(201);

      expect(response.body.message).toEqual('Voucher redeemed successfully');

      const updatedVoucher = await dataSource
        .getRepository(Voucher)
        .findOneBy({ id: voucher.id });
      expect(updatedVoucher.isUsed).toBe(true);
      expect(updatedVoucher.usedAt).toBeDefined();
    });
  });

  describe('/vouchers (GET)', () => {
    it('should return valid vouchers for a customer', async () => {
      const customer = await dataSource.getRepository(Customer).save({
        name: 'Bob Brown',
        email: 'bob.brown@example.com',
      });

      const specialOffer = await dataSource.getRepository(SpecialOffer).save({
        name: 'New Year Sale',
        discountPercentage: 10,
      });

      await dataSource.getRepository(Voucher).save({
        code: 'NY2025',
        expirationDate: '2025-12-31',
        isUsed: false,
        customer,
        specialOffer,
      });

      const response = await request(app.getHttpServer())
        .get('/vouchers')
        .query({ email: customer.email })
        .expect(200);

      expect(response.body).toHaveLength(1);
    });
  });
});
