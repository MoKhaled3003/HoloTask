import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Voucher } from '../voucher/voucher.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Voucher, (voucher) => voucher.customer)
  vouchers: Voucher[];
}
