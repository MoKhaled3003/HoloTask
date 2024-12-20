// src/voucher/voucher.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
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
    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['customer', 'specialOffer'],
    });

    if (!voucher) throw new Error('Voucher not found');
    if (voucher.isUsed) throw new Error('Voucher already used');
    const expirationDate = new Date(voucher.expirationDate);
    if (expirationDate < new Date()) throw new Error('Voucher expired');
    if (voucher.customer.email !== email) throw new Error('Invalid email');

    voucher.isUsed = true;
    voucher.usedAt = new Date();
    await this.voucherRepository.save(voucher);

    return { discountPercentage: voucher.specialOffer.discountPercentage };
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
