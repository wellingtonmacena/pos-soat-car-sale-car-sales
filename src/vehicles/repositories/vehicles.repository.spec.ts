import { VehiclesRepository } from './vehicles.repository';
import { getAppDataSource } from '../../db/data-source';
import { VehicleStatus } from '../entities/vehicle.entity';

jest.mock('../../db/data-source', () => ({
  getAppDataSource: jest.fn(),
}));

describe('VehiclesRepository', () => {
  let repository: VehiclesRepository;
  let vehicleRepositoryMock: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    vehicleRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    (getAppDataSource as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(vehicleRepositoryMock),
    });

    repository = new VehiclesRepository();
  });

  it('creates a vehicle through TypeORM repository', async () => {
    const dto = {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      color: 'Prata',
      price: '129900.90',
      userId: 1,
      status: VehicleStatus.AVAILABLE,
    };
    const entity = { id: 1, ...dto };

    vehicleRepositoryMock.create.mockReturnValue(entity);
    vehicleRepositoryMock.save.mockResolvedValue(entity);

    await expect(repository.create(dto)).resolves.toBe(entity);
    expect(vehicleRepositoryMock.create).toHaveBeenCalledWith(dto);
    expect(vehicleRepositoryMock.save).toHaveBeenCalledWith(entity);
  });

  it('lists vehicles ordered by createdAt ascending by default', async () => {
    const result = [{ id: 1 }];
    vehicleRepositoryMock.find.mockResolvedValue(result);

    await expect(repository.findAll()).resolves.toBe(result);
    expect(vehicleRepositoryMock.find).toHaveBeenCalledWith({
      where: undefined,
      order: { createdAt: 'ASC' },
    });
  });

  it('lists vehicles ordered by price desc when requested', async () => {
    const result = [{ id: 1 }];
    vehicleRepositoryMock.find.mockResolvedValue(result);

    await expect(repository.findAll('price', false)).resolves.toBe(result);
    expect(vehicleRepositoryMock.find).toHaveBeenCalledWith({
      where: undefined,
      order: { price: 'DESC' },
    });
  });

  it('lists vehicles filtered by status when requested', async () => {
    const result = [{ id: 1, status: VehicleStatus.RESERVED }];
    vehicleRepositoryMock.find.mockResolvedValue(result);

    await expect(
      repository.findAll('createdAt', true, VehicleStatus.RESERVED),
    ).resolves.toBe(result);
    expect(vehicleRepositoryMock.find).toHaveBeenCalledWith({
      where: { status: VehicleStatus.RESERVED },
      order: { createdAt: 'ASC' },
    });
  });

  it('lists vehicles by status ordered by price ascending by default', async () => {
    const result = [{ id: 1, status: VehicleStatus.AVAILABLE }];
    vehicleRepositoryMock.find.mockResolvedValue(result);

    await expect(
      repository.findByStatus(VehicleStatus.AVAILABLE),
    ).resolves.toBe(result);
    expect(vehicleRepositoryMock.find).toHaveBeenCalledWith({
      where: { status: VehicleStatus.AVAILABLE },
      order: { price: 'ASC' },
    });
  });

  it('lists vehicles by status ordered descending when requested', async () => {
    const result = [{ id: 1, status: VehicleStatus.SOLD }];
    vehicleRepositoryMock.find.mockResolvedValue(result);

    await expect(
      repository.findByStatus(VehicleStatus.SOLD, 'createdAt', false),
    ).resolves.toBe(result);
    expect(vehicleRepositoryMock.find).toHaveBeenCalledWith({
      where: { status: VehicleStatus.SOLD },
      order: { createdAt: 'DESC' },
    });
  });

  it('finds a vehicle by id', async () => {
    const result = { id: 1 };
    vehicleRepositoryMock.findOneBy.mockResolvedValue(result);

    await expect(repository.findOne(1)).resolves.toBe(result);
    expect(vehicleRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('updates a vehicle by id', async () => {
    const dto = { status: VehicleStatus.SOLD };
    const result = { affected: 1 };
    vehicleRepositoryMock.update.mockResolvedValue(result);

    await expect(repository.update(1, dto)).resolves.toBe(result);
    expect(vehicleRepositoryMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('removes a vehicle by id', async () => {
    const result = { affected: 1 };
    vehicleRepositoryMock.delete.mockResolvedValue(result);

    await expect(repository.remove(1)).resolves.toBe(result);
    expect(vehicleRepositoryMock.delete).toHaveBeenCalledWith(1);
  });
});
