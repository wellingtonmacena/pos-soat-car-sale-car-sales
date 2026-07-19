import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SaleStatus {
  PENDING_PAYMENT = 'pending_payment',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sales')
export class Sale {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ example: 3 })
  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId: number;

  @ApiProperty({ example: '52998224725' })
  @Column({ name: 'buyer_cpf', type: 'varchar', length: 11 })
  buyerCpf: string;

  @ApiProperty({ example: '2026-07-15' })
  @Column({ name: 'sale_date', type: 'date' })
  saleDate: string;

  @ApiProperty({ example: '129900.90' })
  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string;

  @ApiProperty({ example: 'PAY-123456', nullable: true })
  @Column({ name: 'payment_order_code', type: 'varchar', nullable: true })
  paymentOrderCode: string | null;

  @ApiProperty({ example: SaleStatus.PENDING_PAYMENT, enum: SaleStatus })
  @Column({ name: 'status', type: 'varchar', length: 30 })
  status: string;

  @ApiProperty({ example: '2026-07-15T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-15T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
