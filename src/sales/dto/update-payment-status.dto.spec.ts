import { validate } from 'class-validator';
import { UpdatePaymentStatusDto } from './update-payment-status.dto';

describe('UpdatePaymentStatusDto', () => {
  it('accepts a completed status', async () => {
    const dto = new UpdatePaymentStatusDto();
    dto.status = 'completed';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a cancelled status', async () => {
    const dto = new UpdatePaymentStatusDto();
    dto.status = 'cancelled';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status', async () => {
    const dto = new UpdatePaymentStatusDto();
    dto.status = 'unknown' as never;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
