// src/special-offer/special-offer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Voucher } from '../voucher/voucher.entity';

@Entity()
export class SpecialOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  discountPercentage: number;

  @OneToMany(() => Voucher, (voucher) => voucher.specialOffer)
  vouchers: Voucher[];
}
