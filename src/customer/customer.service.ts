import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(name: string, email: string): Promise<Customer> {
    const newCustomer = this.customerRepository.create({ name, email });
    return await this.customerRepository.save(newCustomer);
  }
}
