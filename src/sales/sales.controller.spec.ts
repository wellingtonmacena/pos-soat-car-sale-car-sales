import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

describe('SalesController', () => {
  let controller: SalesController;
  let salesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    updatePaymentStatus: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    salesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updatePaymentStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [{ provide: SalesService, useValue: salesService }],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('delegates create to service', () => {
    const dto = {
      vehicleId: 3,
      buyerCpf: '52998224725',
      saleDate: '2026-07-15',
    };

    salesService.create.mockReturnValue(dto);

    expect(controller.create(dto)).toBe(dto);
    expect(salesService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll to service', () => {
    const result = [{ id: 1 }];
    salesService.findAll.mockReturnValue(result);

    expect(controller.findAll()).toBe(result);
    expect(salesService.findAll).toHaveBeenCalledTimes(1);
  });

  it('converts id to number on findOne', () => {
    const result = { id: 1 };
    salesService.findOne.mockReturnValue(result);

    expect(controller.findOne('1')).toBe(result);
    expect(salesService.findOne).toHaveBeenCalledWith(1);
  });

  it('converts id to number on update', () => {
    const dto = { buyerCpf: '11144477735' };
    const result = { affected: 1 };
    salesService.update.mockReturnValue(result);

    expect(controller.update('1', dto)).toBe(result);
    expect(salesService.update).toHaveBeenCalledWith(1, dto);
  });

  it('converts id to number and delegates to updatePaymentStatus', () => {
    const dto = { status: 'completed' as const };
    const result = { id: 1, status: 'completed' };
    salesService.updatePaymentStatus.mockReturnValue(result);

    expect(controller.updatePaymentStatus('1', dto)).toBe(result);
    expect(salesService.updatePaymentStatus).toHaveBeenCalledWith(
      1,
      'completed',
    );
  });

  it('converts id to number on remove', () => {
    const result = { affected: 1 };
    salesService.remove.mockReturnValue(result);

    expect(controller.remove('1')).toBe(result);
    expect(salesService.remove).toHaveBeenCalledWith(1);
  });
});
