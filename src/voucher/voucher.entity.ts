import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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

  @Column() // Foreign key for Customer
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' }) // Join column maps customerId to the Customer entity
  customer: Customer;

  @Column() // Foreign key for SpecialOffer
  specialOfferId: number;

  @ManyToOne(() => SpecialOffer)
  @JoinColumn({ name: 'specialOfferId' }) // Join column maps specialOfferId to the SpecialOffer entity
  specialOffer: SpecialOffer;
}
