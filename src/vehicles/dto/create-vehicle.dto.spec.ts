import { validate } from 'class-validator';
import { CreateVehicleDto } from './create-vehicle.dto';
import { VehicleStatus } from '../entities/vehicle.entity';

describe('CreateVehicleDto', () => {
  const validDto = () => {
    const dto = new CreateVehicleDto();
    dto.brand = 'Toyota';
    dto.model = 'Corolla';
    dto.year = 2024;
    dto.color = 'Prata';
    dto.price = '129900.90';
    dto.userId = 1;

    return dto;
  };

  it('accepts a valid payload without status', async () => {
    const dto = validDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a valid payload with a valid status', async () => {
    const dto = validDto();
    dto.status = VehicleStatus.AVAILABLE;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status', async () => {
    const dto = validDto();
    (dto as unknown as { status: string }).status = 'unknown';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });

  it('rejects an empty brand', async () => {
    const dto = validDto();
    dto.brand = '';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'brand')).toBe(true);
  });

  it('rejects a non-integer year', async () => {
    const dto = validDto();
    (dto as unknown as { year: unknown }).year = '2024';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'year')).toBe(true);
  });

  it('rejects a non-numeric price', async () => {
    const dto = validDto();
    dto.price = 'not-a-number';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'price')).toBe(true);
  });

  it('rejects a non-integer userId', async () => {
    const dto = validDto();
    (dto as unknown as { userId: unknown }).userId = 'abc';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'userId')).toBe(true);
  });
});
