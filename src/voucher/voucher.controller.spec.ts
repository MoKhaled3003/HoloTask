// src/voucher/voucher.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('VoucherController', () => {
  let controller: VoucherController;
  let service: VoucherService;

  const mockVoucherService = {
    createVoucher: jest.fn(),
    generateVouchers: jest.fn(),
    redeemVoucher: jest.fn(),
    getCustomerVouchers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherController],
      providers: [
        {
          provide: VoucherService,
          useValue: mockVoucherService,
        },
      ],
    }).compile();

    controller = module.get<VoucherController>(VoucherController);
    service = module.get<VoucherService>(VoucherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVoucher', () => {
    it('should return a created voucher', async () => {
      const mockVoucher = { id: 1, code: 'ABC12345' };
      mockVoucherService.createVoucher.mockResolvedValue(mockVoucher);

      const result = await controller.createVoucher({
        customerId: 1,
        specialOfferId: 2,
        expirationDate: '2025-12-31',
      });

      expect(service.createVoucher).toHaveBeenCalledWith(1, 2, '2025-12-31');
      expect(result).toEqual({
        message: 'Voucher created successfully',
        voucher: mockVoucher,
      });
    });
  });

  describe('generateVouchers', () => {
    it('should return generated vouchers', async () => {
      const mockVouchers = [{ id: 1 }, { id: 2 }];
      mockVoucherService.generateVouchers.mockResolvedValue(mockVouchers);

      const result = await controller.generateVouchers({
        specialOfferId: 2,
        expirationDate: '2025-12-31',
      });

      expect(service.generateVouchers).toHaveBeenCalledWith(2, '2025-12-31');
      expect(result).toEqual({
        message: 'Vouchers generated successfully',
        vouchers: mockVouchers,
      });
    });
  });

  describe('redeemVoucher', () => {
    it('should redeem a voucher successfully', async () => {
      const mockResult = { discountPercentage: 20 };
      mockVoucherService.redeemVoucher.mockResolvedValue(mockResult);

      const result = await controller.redeemVoucher({
        voucherCode: 'ABC12345',
        email: 'john.doe@example.com',
      });

      expect(service.redeemVoucher).toHaveBeenCalledWith(
        'ABC12345',
        'john.doe@example.com',
      );
      expect(result).toEqual({
        message: 'Voucher redeemed successfully',
        discount: 20,
      });
    });

    it('should throw an error if redeeming fails', async () => {
      mockVoucherService.redeemVoucher.mockRejectedValue(
        new Error('Voucher already used'),
      );

      await expect(
        controller.redeemVoucher({
          voucherCode: 'ABC12345',
          email: 'john.doe@example.com',
        }),
      ).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Voucher already used',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(service.redeemVoucher).toHaveBeenCalledWith(
        'ABC12345',
        'john.doe@example.com',
      );
    });
  });

  describe('getCustomerVouchers', () => {
    it('should return a list of valid vouchers', async () => {
      const mockVouchers = [
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
      ];

      mockVoucherService.getCustomerVouchers.mockResolvedValue(mockVouchers);

      const result = await controller.getCustomerVouchers(
        'john.doe@example.com',
      );

      expect(service.getCustomerVouchers).toHaveBeenCalledWith(
        'john.doe@example.com',
      );
      expect(result).toEqual(mockVouchers);
    });
  });
});
