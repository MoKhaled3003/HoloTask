import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';

@Controller('customers')
@ApiTags('Customers') // Swagger tag for this controller
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' }) // Summary of the endpoint
  @ApiBody({
    description: 'Payload to create a customer',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    },
  })
  async createCustomer(
    @Body() body: { name: string; email: string },
  ): Promise<Customer> {
    return await this.customerService.createCustomer(body.name, body.email);
  }
}
