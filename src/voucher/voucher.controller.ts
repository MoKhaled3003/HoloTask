import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { VoucherService } from './voucher.service';

@Controller('vouchers')
@ApiTags('Vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new voucher' })
  @ApiBody({
    description: 'Payload to create a voucher',
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'number', example: 1 },
        specialOfferId: { type: 'number', example: 2 },
        expirationDate: { type: 'string', example: '2025-12-31' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Voucher created successfully',
    schema: {
      example: {
        message: 'Voucher created successfully',
        voucher: {
          id: 1,
          code: 'ABC12345',
          expirationDate: '2025-12-31',
          isUsed: false,
          usedAt: null,
          customer: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
          specialOffer: {
            id: 2,
            name: 'Black Friday Sale',
            discountPercentage: 20,
          },
        },
      },
    },
  })
  async createVoucher(
    @Body()
    body: {
      customerId: number;
      specialOfferId: number;
      expirationDate: string;
    },
  ) {
    const voucher = await this.voucherService.createVoucher(
      body.customerId,
      body.specialOfferId,
      body.expirationDate,
    );
    return { message: 'Voucher created successfully', voucher };
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate vouchers for all customers' })
  @ApiBody({
    description: 'Payload to generate vouchers',
    schema: {
      type: 'object',
      properties: {
        specialOfferId: { type: 'number', example: 2 },
        expirationDate: { type: 'string', example: '2025-12-31' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Vouchers generated successfully',
    schema: {
      example: {
        message: 'Vouchers generated successfully',
      },
    },
  })
  async generateVouchers(
    @Body() body: { specialOfferId: number; expirationDate: string },
  ) {
    const vouchers = await this.voucherService.generateVouchers(
      body.specialOfferId,
      body.expirationDate,
    );
    return { message: 'Vouchers generated successfully', vouchers };
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem a voucher' })
  @ApiBody({
    description: 'Payload to redeem a voucher',
    schema: {
      type: 'object',
      properties: {
        voucherCode: { type: 'string', example: 'ABC12345' },
        email: { type: 'string', example: 'john.doe@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher redeemed successfully',
    schema: {
      example: {
        message: 'Voucher redeemed successfully',
        discount: 20,
      },
    },
  })
  async redeemVoucher(@Body() body: { voucherCode: string; email: string }) {
    try {
      const result = await this.voucherService.redeemVoucher(
        body.voucherCode,
        body.email,
      );
      return {
        message: 'Voucher redeemed successfully',
        discount: result.discountPercentage,
      };
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get valid vouchers for a customer' })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'The email address of the customer',
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'List of valid vouchers',
    schema: {
      example: [
        {
          id: 1,
          code: 'ABC12345',
          expirationDate: '2025-12-31',
          isUsed: false,
          customer: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
          specialOffer: {
            id: 2,
            name: 'Black Friday Sale',
            discountPercentage: 20,
          },
        },
      ],
    },
  })
  async getCustomerVouchers(@Query('email') email: string) {
    return await this.voucherService.getCustomerVouchers(email);
  }
}
