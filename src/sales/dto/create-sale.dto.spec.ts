import { validate } from 'class-validator';
import { CreateSaleDto } from './create-sale.dto';

describe('CreateSaleDto', () => {
  it('accepts a valid payload without saleDate', async () => {
    const dto = new CreateSaleDto();
    dto.vehicleId = 3;
    dto.buyerCpf = '52998224725';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a valid payload with saleDate', async () => {
    const dto = new CreateSaleDto();
    dto.vehicleId = 3;
    dto.buyerCpf = '52998224725';
    dto.saleDate = '2026-07-15';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects a non-integer vehicleId', async () => {
    const dto = new CreateSaleDto();
    (dto as unknown as { vehicleId: unknown }).vehicleId = 'abc';
    dto.buyerCpf = '52998224725';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'vehicleId')).toBe(true);
  });

  it('rejects an invalid buyerCpf', async () => {
    const dto = new CreateSaleDto();
    dto.vehicleId = 3;
    dto.buyerCpf = '11111111111';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'buyerCpf')).toBe(true);
  });

  it('rejects an invalid saleDate', async () => {
    const dto = new CreateSaleDto();
    dto.vehicleId = 3;
    dto.buyerCpf = '52998224725';
    dto.saleDate = 'not-a-date';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'saleDate')).toBe(true);
  });
});
