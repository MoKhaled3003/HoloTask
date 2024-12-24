import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository, DataSource } from 'typeorm';
import { Voucher } from './voucher.entity';
import { Customer } from '../customer/customer.entity';
import { SpecialOffer } from '../special-offer/special-offer.entity';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher) private voucherRepository: Repository<Voucher>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(SpecialOffer)
    private specialOfferRepository: Repository<SpecialOffer>,
    private readonly dataSource: DataSource,
  ) {}

  async createVoucher(
    customerId: number,
    specialOfferId: number,
    expirationDate: string,
  ): Promise<Voucher> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) throw new Error('Customer not found');

    const specialOffer = await this.specialOfferRepository.findOne({
      where: { id: specialOfferId },
    });
    if (!specialOffer) throw new Error('Special offer not found');

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const voucher = this.voucherRepository.create({
      code,
      expirationDate,
      customer,
      specialOffer,
    });

    return await this.voucherRepository.save(voucher);
  }

  async generateVouchers(
    specialOfferId: number,
    expirationDate: string,
  ): Promise<Voucher[]> {
    const customers = await this.customerRepository.find();
    const specialOffer = await this.specialOfferRepository.findOne({
      where: { id: specialOfferId },
    });

    if (!specialOffer) throw new Error('Special offer not found');
    if (customers.length == 0) throw new Error('No Customers Found');

    const vouchers = customers.map((customer) => {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      return this.voucherRepository.create({
        code,
        expirationDate,
        customer,
        specialOffer,
      });
    });

    return await this.voucherRepository.save(vouchers);
  }

  async redeemVoucher(
    code: string,
    email: string,
  ): Promise<{ discountPercentage: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const voucher = await queryRunner.manager.findOne(Voucher, {
        where: { code },
        lock: { mode: 'pessimistic_write' },
      });

      if (!voucher) throw new Error('Voucher not found');
      if (voucher.isUsed) throw new Error('Voucher already used');
      const expirationDate = new Date(voucher.expirationDate);
      if (expirationDate < new Date()) throw new Error('Voucher expired');

      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: voucher.customerId },
      });

      if (!customer || customer.email !== email) {
        throw new Error('Invalid email');
      }

      const specialOffer = await queryRunner.manager.findOne(SpecialOffer, {
        where: { id: voucher.specialOfferId },
      });

      if (!specialOffer) {
        throw new Error('Special offer not found');
      }

      voucher.isUsed = true;
      voucher.usedAt = new Date();

      await queryRunner.manager.save(voucher);
      await queryRunner.commitTransaction();

      return { discountPercentage: specialOffer.discountPercentage };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerVouchers(email: string): Promise<Voucher[]> {
    const today = new Date().toISOString().split('T')[0]; // Format the current date as YYYY-MM-DD
    return this.voucherRepository.find({
      where: {
        customer: { email },
        isUsed: false,
        expirationDate: MoreThan(today), // Compare using the formatted date
      },
      relations: ['specialOffer'],
    });
  }
}
