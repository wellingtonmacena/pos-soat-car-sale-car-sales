import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export type PaymentStatus = 'completed' | 'cancelled';

export const PAYMENT_STATUSES: PaymentStatus[] = ['completed', 'cancelled'];

export class UpdatePaymentStatusDto {
  @ApiProperty({ example: 'completed', enum: PAYMENT_STATUSES })
  @IsIn(PAYMENT_STATUSES)
  status: PaymentStatus;
}
