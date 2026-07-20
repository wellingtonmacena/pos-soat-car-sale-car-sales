import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { VehiclesRepository } from './repositories/vehicles.repository';
import { VehicleStatus } from './entities/vehicle.entity';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehiclesRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByStatus: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    vehiclesRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByStatus: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: VehiclesRepository,
          useValue: vehiclesRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('delegates create to repository', () => {
    const dto = {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      color: 'Prata',
      price: '129900.90',
      userId: 1,
      status: VehicleStatus.AVAILABLE,
    };

    vehiclesRepository.create.mockReturnValue(dto);

    expect(service.create(dto)).toBe(dto);
    expect(vehiclesRepository.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll to repository', () => {
    const result = [{ id: 1 }];
    vehiclesRepository.findAll.mockReturnValue(result);

    expect(service.findAll('price', false, VehicleStatus.AVAILABLE)).toBe(
      result,
    );
    expect(vehiclesRepository.findAll).toHaveBeenCalledWith(
      'price',
      false,
      VehicleStatus.AVAILABLE,
    );
  });

  it('delegates findOne to repository', () => {
    const result = { id: 1 };
    vehiclesRepository.findOne.mockReturnValue(result);

    expect(service.findOne(1)).toBe(result);
    expect(vehiclesRepository.findOne).toHaveBeenCalledWith(1);
  });

  it('delegates findForSale to repository with available status sorted by price ascending', () => {
    const result = [{ id: 1, status: VehicleStatus.AVAILABLE }];
    vehiclesRepository.findByStatus.mockReturnValue(result);

    expect(service.findForSale()).toBe(result);
    expect(vehiclesRepository.findByStatus).toHaveBeenCalledWith(
      VehicleStatus.AVAILABLE,
      'price',
      true,
    );
  });

  it('delegates findSold to repository with sold status sorted by price ascending', () => {
    const result = [{ id: 2, status: VehicleStatus.SOLD }];
    vehiclesRepository.findByStatus.mockReturnValue(result);

    expect(service.findSold()).toBe(result);
    expect(vehiclesRepository.findByStatus).toHaveBeenCalledWith(
      VehicleStatus.SOLD,
      'price',
      true,
    );
  });

  it('delegates update to repository', () => {
    const dto = { status: VehicleStatus.SOLD };
    const result = { affected: 1 };
    vehiclesRepository.update.mockReturnValue(result);

    expect(service.update(1, dto)).toBe(result);
    expect(vehiclesRepository.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates remove to repository', () => {
    const result = { affected: 1 };
    vehiclesRepository.remove.mockReturnValue(result);

    expect(service.remove(1)).toBe(result);
    expect(vehiclesRepository.remove).toHaveBeenCalledWith(1);
  });
});
