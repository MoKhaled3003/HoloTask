// src/voucher/voucher.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { VoucherService } from './voucher.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { Customer } from '../customer/customer.entity';
import { SpecialOffer } from '../special-offer/special-offer.entity';
import { DataSource } from 'typeorm';

const mockVoucherRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

const mockCustomerRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
});

const mockSpecialOfferRepository = () => ({
  findOne: jest.fn(),
});

const mockDataSource = () => ({
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  }),
});

describe('VoucherService', () => {
  let service: VoucherService;
  let voucherRepository;
  let customerRepository;
  let specialOfferRepository;
  let dataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: getRepositoryToken(Voucher),
          useFactory: mockVoucherRepository,
        },
        {
          provide: getRepositoryToken(Customer),
          useFactory: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(SpecialOffer),
          useFactory: mockSpecialOfferRepository,
        },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
    voucherRepository = module.get(getRepositoryToken(Voucher));
    customerRepository = module.get(getRepositoryToken(Customer));
    specialOfferRepository = module.get(getRepositoryToken(SpecialOffer));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVoucher', () => {
    it('should create and save a voucher', async () => {
      const mockCustomer = { id: 1 };
      const mockSpecialOffer = { id: 2 };
      const mockVoucher = { id: 1, code: 'ABC12345' };

      customerRepository.findOne.mockResolvedValue(mockCustomer);
      specialOfferRepository.findOne.mockResolvedValue(mockSpecialOffer);
      voucherRepository.create.mockReturnValue(mockVoucher);
      voucherRepository.save.mockResolvedValue(mockVoucher);

      const result = await service.createVoucher(1, 2, '2025-12-31');

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(specialOfferRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(voucherRepository.create).toHaveBeenCalled();
      expect(voucherRepository.save).toHaveBeenCalledWith(mockVoucher);
      expect(result).toEqual(mockVoucher);
    });

    it('should throw an error if customer is not found', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.createVoucher(1, 2, '2025-12-31')).rejects.toThrow(
        'Customer not found',
      );
    });

    it('should throw an error if special offer is not found', async () => {
      customerRepository.findOne.mockResolvedValue({ id: 1 });
      specialOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.createVoucher(1, 2, '2025-12-31')).rejects.toThrow(
        'Special offer not found',
      );
    });
  });

  describe('generateVouchers', () => {
    it('should generate vouchers for all customers', async () => {
      const mockCustomers = [{ id: 1 }, { id: 2 }];
      const mockSpecialOffer = { id: 2 };
      const mockVouchers = [{ id: 1 }, { id: 2 }];

      customerRepository.find.mockResolvedValue(mockCustomers);
      specialOfferRepository.findOne.mockResolvedValue(mockSpecialOffer);
      voucherRepository.save.mockResolvedValue(mockVouchers);

      const result = await service.generateVouchers(2, '2025-12-31');

      expect(customerRepository.find).toHaveBeenCalled();
      expect(specialOfferRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(voucherRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockVouchers);
    });

    it('should throw an error if special offer is not found', async () => {
      specialOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.generateVouchers(2, '2025-12-31')).rejects.toThrow(
        'Special offer not found',
      );
    });
  });

  describe('redeemVoucher', () => {
    it('should redeem a voucher successfully', async () => {
      const mockVoucher = {
        id: 1,
        code: 'ABC12345',
        isUsed: false,
        expirationDate: '2025-12-31',
        customer: { email: 'test@example.com' },
        specialOffer: { discountPercentage: 20 },
      };

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue(mockVoucher);

      const result = await service.redeemVoucher(
        'ABC12345',
        'test@example.com',
      );

      expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Voucher, {
        where: { code: 'ABC12345' },
        relations: ['customer', 'specialOffer'],
      });
      expect(queryRunner.manager.save).toHaveBeenCalledWith({
        ...mockVoucher,
        isUsed: true,
        usedAt: expect.any(Date),
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual({ discountPercentage: 20 });
    });

    it('should throw an error if voucher is not found', async () => {
      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue(null);

      await expect(
        service.redeemVoucher('ABC12345', 'test@example.com'),
      ).rejects.toThrow('Voucher not found');
    });

    it('should throw an error if voucher is already used', async () => {
      const mockVoucher = {
        id: 1,
        code: 'ABC12345',
        isUsed: true,
        expirationDate: '2025-12-31',
        customer: { email: 'test@example.com' },
      };

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue(mockVoucher);

      await expect(
        service.redeemVoucher('ABC12345', 'test@example.com'),
      ).rejects.toThrow('Voucher already used');
    });

    it('should throw an error if voucher is expired', async () => {
      const mockVoucher = {
        id: 1,
        code: 'ABC12345',
        isUsed: false,
        expirationDate: '2020-12-31',
        customer: { email: 'test@example.com' },
      };

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue(mockVoucher);

      await expect(
        service.redeemVoucher('ABC12345', 'test@example.com'),
      ).rejects.toThrow('Voucher expired');
    });

    it('should throw an error if email does not match', async () => {
      const mockVoucher = {
        id: 1,
        code: 'ABC12345',
        isUsed: false,
        expirationDate: '2025-12-31',
        customer: { email: 'different@example.com' },
      };

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue(mockVoucher);

      await expect(
        service.redeemVoucher('ABC12345', 'test@example.com'),
      ).rejects.toThrow('Invalid email');
    });
  });
});
