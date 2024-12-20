// src/customer/customer.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(
    @Body() body: { name: string; email: string },
  ): Promise<Customer> {
    return await this.customerService.createCustomer(body.name, body.email);
  }
}
