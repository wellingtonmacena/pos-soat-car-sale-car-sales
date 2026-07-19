import { SalesRepository } from './sales.repository';
import { getAppDataSource } from '../../db/data-source';

jest.mock('../../db/data-source', () => ({
  getAppDataSource: jest.fn(),
}));

describe('SalesRepository', () => {
  let repository: SalesRepository;
  let saleRepositoryMock: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    saleRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    (getAppDataSource as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(saleRepositoryMock),
    });

    repository = new SalesRepository();
  });

  it('creates a sale through TypeORM repository', async () => {
    const dto = {
      vehicleId: 3,
      buyerCpf: '52998224725',
      saleDate: '2026-07-15',
      totalPrice: '100.00',
      status: 'pending_payment',
      paymentOrderCode: null,
    };
    const entity = { id: 1, ...dto };

    saleRepositoryMock.create.mockReturnValue(entity);
    saleRepositoryMock.save.mockResolvedValue(entity);

    await expect(repository.create(dto)).resolves.toBe(entity);
    expect(saleRepositoryMock.create).toHaveBeenCalledWith(dto);
    expect(saleRepositoryMock.save).toHaveBeenCalledWith(entity);
  });

  it('lists sales ordered by createdAt desc', async () => {
    const result = [{ id: 1 }];
    saleRepositoryMock.find.mockResolvedValue(result);

    await expect(repository.findAll()).resolves.toBe(result);
    expect(saleRepositoryMock.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
  });

  it('finds a sale by id', async () => {
    const result = { id: 1 };
    saleRepositoryMock.findOneBy.mockResolvedValue(result);

    await expect(repository.findOne(1)).resolves.toBe(result);
    expect(saleRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('updates a sale by id', async () => {
    const dto = { buyerCpf: '11144477735' };
    const result = { affected: 1 };
    saleRepositoryMock.update.mockResolvedValue(result);

    await expect(repository.update(1, dto)).resolves.toBe(result);
    expect(saleRepositoryMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('removes a sale by id', async () => {
    const result = { affected: 1 };
    saleRepositoryMock.delete.mockResolvedValue(result);

    await expect(repository.remove(1)).resolves.toBe(result);
    expect(saleRepositoryMock.delete).toHaveBeenCalledWith(1);
  });
});
