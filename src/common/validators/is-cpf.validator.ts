import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas) number using the
 * standard mod-11 check-digit algorithm.
 *
 * Rules enforced:
 * - Must be exactly 11 numeric digits (no punctuation).
 * - Must not be one of the well-known invalid all-same-digit sequences
 *   (e.g. '11111111111', '00000000000').
 * - Both check digits (10th and 11th) must match the mod-11 calculation.
 */
export function isValidCpf(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  if (!/^\d{11}$/.test(value)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);

  const calculateCheckDigit = (length: number): number => {
    let sum = 0;

    for (let i = 0; i < length; i++) {
      sum += digits[i] * (length + 1 - i);
    }

    const remainder = (sum * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  const firstCheckDigit = calculateCheckDigit(9);
  const secondCheckDigit = calculateCheckDigit(10);

  return firstCheckDigit === digits[9] && secondCheckDigit === digits[10];
}

@ValidatorConstraint({ name: 'isCpf', async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidCpf(value);
  }

  defaultMessage(): string {
    return 'buyerCpf must be a valid CPF number';
  }
}

export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfConstraint,
    });
  };
}
