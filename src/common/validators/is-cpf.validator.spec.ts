import { validate } from 'class-validator';
import { IsCpf, IsCpfConstraint, isValidCpf } from './is-cpf.validator';

class DummyDto {
  @IsCpf()
  cpf: string;
}

describe('isValidCpf', () => {
  it.each(['52998224725', '11144477735', '12345678909', '39053344705'])(
    'accepts a valid CPF: %s',
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(true);
    },
  );

  it('rejects a CPF with an invalid check digit', () => {
    expect(isValidCpf('52998224700')).toBe(false);
  });

  it('rejects a CPF with the wrong length', () => {
    expect(isValidCpf('529982247')).toBe(false);
    expect(isValidCpf('529982247251')).toBe(false);
  });

  it('rejects a non-numeric string', () => {
    expect(isValidCpf('5299822472a')).toBe(false);
    expect(isValidCpf('529.982.247-25')).toBe(false);
  });

  it('rejects repeated-digit sequences', () => {
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('00000000000')).toBe(false);
    expect(isValidCpf('99999999999')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isValidCpf(12345678909)).toBe(false);
    expect(isValidCpf(undefined)).toBe(false);
    expect(isValidCpf(null)).toBe(false);
  });
});

describe('IsCpfConstraint', () => {
  const constraint = new IsCpfConstraint();

  it('validates using isValidCpf', () => {
    expect(constraint.validate('52998224725')).toBe(true);
    expect(constraint.validate('11111111111')).toBe(false);
  });

  it('returns a default message', () => {
    expect(constraint.defaultMessage()).toBe(
      'buyerCpf must be a valid CPF number',
    );
  });
});

describe('@IsCpf decorator', () => {
  it('passes validation for a valid CPF', async () => {
    const dto = new DummyDto();
    dto.cpf = '52998224725';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation for an invalid CPF', async () => {
    const dto = new DummyDto();
    dto.cpf = '11111111111';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual(
      expect.objectContaining({
        isCpf: 'buyerCpf must be a valid CPF number',
      }),
    );
  });

  it('fails validation for a CPF with wrong length', async () => {
    const dto = new DummyDto();
    dto.cpf = '123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
  });
});
