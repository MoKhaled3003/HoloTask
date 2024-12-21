import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { SpecialOffer } from '../special-offer/special-offer.entity';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'date' })
  expirationDate: string;
  @Column({ default: false })
  isUsed: boolean;

  @Column({ nullable: true })
  usedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.vouchers, {
    nullable: false,
  })
  customer: Customer;

  @ManyToOne(() => SpecialOffer, (specialOffer) => specialOffer.vouchers, {
    nullable: false,
  })
  specialOffer: SpecialOffer;
}
