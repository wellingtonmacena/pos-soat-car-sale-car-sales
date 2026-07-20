import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { SalesService } from './sales.service';
import { SalesRepository } from './repositories/sales.repository';
import { SaleStatus } from './entities/sale.entity';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { getAppDataSource } from '../db/data-source';

jest.mock('../db/data-source', () => ({
  getAppDataSource: jest.fn(),
}));

describe('SalesService', () => {
  let service: SalesService;
  let axiosPostSpy: jest.SpiedFunction<typeof axios.post>;
  let salesRepository: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let vehicleRepositoryMock: {
    findOneBy: jest.Mock;
    save: jest.Mock;
  };
  let saleRepositoryMock: {
    create: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
  };
  let managerMock: {
    getRepository: jest.Mock;
  };

  const buildVehicle = (overrides = {}) => ({
    id: 3,
    price: '129900.90',
    status: VehicleStatus.AVAILABLE,
    ...overrides,
  });

  beforeEach(async () => {
    salesRepository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: SalesRepository,
          useValue: salesRepository,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);

    vehicleRepositoryMock = {
      findOneBy: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    saleRepositoryMock = {
      create: jest.fn().mockImplementation((data: object) => data),
      save: jest
        .fn()
        .mockImplementation((entity: { id?: number }) =>
          Promise.resolve({ id: entity.id ?? 1, ...entity }),
        ),
      findOneBy: jest.fn(),
    };

    managerMock = {
      getRepository: jest
        .fn()
        .mockImplementation((entity: { name: string }) => {
          if (entity.name === 'Vehicle') {
            return vehicleRepositoryMock;
          }

          return saleRepositoryMock;
        }),
    };

    (getAppDataSource as jest.Mock).mockResolvedValue({
      transaction: jest
        .fn()
        .mockImplementation((cb: (manager: unknown) => unknown) =>
          cb(managerMock),
        ),
    });

    process.env.PAYMENT_ORDER_SERVICE_URL =
      'http://payment-service/payment-orders';

    axiosPostSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    axiosPostSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      vehicleId: 3,
      buyerCpf: '52998224725',
      saleDate: '2026-07-15',
    };

    it('creates a sale, reserves the vehicle and stores the payment code', async () => {
      const vehicle = buildVehicle();
      vehicleRepositoryMock.findOneBy.mockResolvedValue(vehicle);
      axiosPostSpy.mockResolvedValue({
        data: { paymentCode: 'PAY-123' },
      });

      const result = await service.create(dto);

      expect(vehicleRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: dto.vehicleId,
      });
      expect(saleRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicleId: 3,
          buyerCpf: dto.buyerCpf,
          saleDate: dto.saleDate,
          totalPrice: vehicle.price,
          status: SaleStatus.PENDING_PAYMENT,
          paymentOrderCode: null,
        }),
      );
      expect(vehicle.status).toBe(VehicleStatus.RESERVED);
      expect(vehicleRepositoryMock.save).toHaveBeenCalledWith(vehicle);
      expect(axiosPostSpy).toHaveBeenCalledWith(
        'http://payment-service/payment-orders',
        expect.objectContaining({ saleId: 1 }),
      );
      expect(result.paymentOrderCode).toBe('PAY-123');
    });

    it('defaults saleDate to today when not provided', async () => {
      const vehicle = buildVehicle();
      vehicleRepositoryMock.findOneBy.mockResolvedValue(vehicle);
      axiosPostSpy.mockResolvedValue({
        data: { paymentCode: 'PAY-123' },
      });

      await service.create({ vehicleId: 3, buyerCpf: '52998224725' });

      expect(saleRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          saleDate: new Date().toISOString().slice(0, 10),
        }),
      );
    });

    it('handles a payment response without a paymentCode field defensively', async () => {
      const vehicle = buildVehicle();
      vehicleRepositoryMock.findOneBy.mockResolvedValue(vehicle);
      axiosPostSpy.mockResolvedValue({ data: {} });

      const result = await service.create(dto);

      expect(result.paymentOrderCode).toBeNull();
    });

    it('throws BadRequestException when vehicle does not exist', async () => {
      vehicleRepositoryMock.findOneBy.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(saleRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when vehicle is not available', async () => {
      vehicleRepositoryMock.findOneBy.mockResolvedValue(
        buildVehicle({ status: VehicleStatus.SOLD }),
      );

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(saleRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('throws ServiceUnavailableException when PAYMENT_ORDER_SERVICE_URL is missing', async () => {
      delete process.env.PAYMENT_ORDER_SERVICE_URL;
      vehicleRepositoryMock.findOneBy.mockResolvedValue(buildVehicle());

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('throws ServiceUnavailableException and rolls back when the payment call fails', async () => {
      const vehicle = buildVehicle();
      vehicleRepositoryMock.findOneBy.mockResolvedValue(vehicle);
      axiosPostSpy.mockRejectedValue(new Error('service down'));

      const dataSource = await getAppDataSource();

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );

      // The transaction callback threw, so TypeORM would roll back any
      // writes performed inside it (sale insert + vehicle status update).
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(saleRepositoryMock.create).toHaveBeenCalled();
      expect(vehicleRepositoryMock.save).toHaveBeenCalled();
    });
  });

  describe('updatePaymentStatus', () => {
    it('marks a sale as completed and the vehicle as sold', async () => {
      const sale = { id: 1, vehicleId: 3, status: SaleStatus.PENDING_PAYMENT };
      const vehicle = buildVehicle();
      saleRepositoryMock.findOneBy.mockResolvedValue(sale);
      vehicleRepositoryMock.findOneBy.mockResolvedValue(vehicle);

      const result = await service.updatePaymentStatus(1, 'completed');

      expect(sale.status).toBe(SaleStatus.COMPLETED);
      expect(vehicle.status).toBe(VehicleStatus.SOLD);
      expect(vehicleRepositoryMock.save).toHaveBeenCalledWith(vehicle);
      expect(result).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('marks a sale as cancelled and frees the vehicle', async () => {
      const sale = { id: 1, vehicleId: 3, status: SaleStatus.PENDING_PAYMENT };
      const vehicle = buildVehicle({ status: VehicleStatus.RESERVED });
      saleRepositoryMock.findOneBy.mockResolvedValue(sale);
      vehicleRepositoryMock.findOneBy.mockResolvedValue(vehicle);

      await service.updatePaymentStatus(1, 'cancelled');

      expect(sale.status).toBe(SaleStatus.CANCELLED);
      expect(vehicle.status).toBe(VehicleStatus.AVAILABLE);
    });

    it('throws NotFoundException when the sale does not exist', async () => {
      saleRepositoryMock.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatePaymentStatus(1, 'completed'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when the related vehicle does not exist', async () => {
      saleRepositoryMock.findOneBy.mockResolvedValue({
        id: 1,
        vehicleId: 3,
        status: SaleStatus.PENDING_PAYMENT,
      });
      vehicleRepositoryMock.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatePaymentStatus(1, 'completed'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it('delegates findAll to repository', () => {
    const result = [{ id: 1 }];
    salesRepository.findAll.mockReturnValue(result);

    expect(service.findAll()).toBe(result);
    expect(salesRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('delegates findOne to repository', () => {
    const result = { id: 1 };
    salesRepository.findOne.mockReturnValue(result);

    expect(service.findOne(1)).toBe(result);
    expect(salesRepository.findOne).toHaveBeenCalledWith(1);
  });

  it('delegates update to repository', () => {
    const dto = { buyerCpf: '11144477735' };
    const result = { affected: 1 };
    salesRepository.update.mockReturnValue(result);

    expect(service.update(1, dto)).toBe(result);
    expect(salesRepository.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates remove to repository', () => {
    const result = { affected: 1 };
    salesRepository.remove.mockReturnValue(result);

    expect(service.remove(1)).toBe(result);
    expect(salesRepository.remove).toHaveBeenCalledWith(1);
  });
});
