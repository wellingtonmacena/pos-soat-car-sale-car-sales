import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehicleStatus } from './entities/vehicle.entity';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let vehiclesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findForSale: jest.Mock;
    findSold: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    vehiclesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findForSale: jest.fn(),
      findSold: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [{ provide: VehiclesService, useValue: vehiclesService }],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
  });

  it('delegates create to service', () => {
    const dto = {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      color: 'Prata',
      price: '129900.90',
      userId: 1,
      status: VehicleStatus.AVAILABLE,
    };

    vehiclesService.create.mockReturnValue(dto);

    expect(controller.create(dto)).toBe(dto);
    expect(vehiclesService.create).toHaveBeenCalledWith(dto);
  });

  it('normalizes findAll query params before calling service', () => {
    const result = [{ id: 1 }];
    vehiclesService.findAll.mockReturnValue(result);

    expect(controller.findAll('price', 'false', VehicleStatus.SOLD)).toBe(
      result,
    );
    expect(vehiclesService.findAll).toHaveBeenCalledWith(
      'price',
      false,
      VehicleStatus.SOLD,
    );
  });

  it('defaults findAll sort field to createdAt and sortAsc to true', () => {
    const result = [{ id: 1 }];
    vehiclesService.findAll.mockReturnValue(result);

    expect(controller.findAll(undefined, undefined)).toBe(result);
    expect(vehiclesService.findAll).toHaveBeenCalledWith(
      'createdAt',
      true,
      undefined,
    );
  });

  it('ignores invalid status on findAll query params', () => {
    const result = [{ id: 1 }];
    vehiclesService.findAll.mockReturnValue(result);

    expect(controller.findAll('createdAt', 'true', 'invalid' as VehicleStatus)).toBe(result);
    expect(vehiclesService.findAll).toHaveBeenCalledWith(
      'createdAt',
      true,
      undefined,
    );
  });

  it('delegates findForSale to service', () => {
    const result = [{ id: 1, status: 'available' }];
    vehiclesService.findForSale.mockReturnValue(result);

    expect(controller.findForSale()).toBe(result);
    expect(vehiclesService.findForSale).toHaveBeenCalledTimes(1);
  });

  it('delegates findSold to service', () => {
    const result = [{ id: 2, status: 'sold' }];
    vehiclesService.findSold.mockReturnValue(result);

    expect(controller.findSold()).toBe(result);
    expect(vehiclesService.findSold).toHaveBeenCalledTimes(1);
  });

  it('converts id to number on findOne', () => {
    const result = { id: 1 };
    vehiclesService.findOne.mockReturnValue(result);

    expect(controller.findOne('1')).toBe(result);
    expect(vehiclesService.findOne).toHaveBeenCalledWith(1);
  });

  it('converts id to number on update', () => {
    const dto = { status: VehicleStatus.SOLD };
    const result = { affected: 1 };
    vehiclesService.update.mockReturnValue(result);

    expect(controller.update('1', dto)).toBe(result);
    expect(vehiclesService.update).toHaveBeenCalledWith(1, dto);
  });

  it('converts id to number on remove', () => {
    const result = { affected: 1 };
    vehiclesService.remove.mockReturnValue(result);

    expect(controller.remove('1')).toBe(result);
    expect(vehiclesService.remove).toHaveBeenCalledWith(1);
  });
});
