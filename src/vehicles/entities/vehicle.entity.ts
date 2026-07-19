import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum VehicleStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
}

@Entity('vehicles')
export class Vehicle {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ example: 'Toyota' })
  @Column({ name: 'brand', type: 'varchar', length: 100 })
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @Column({ name: 'model', type: 'varchar', length: 150 })
  model: string;

  @ApiProperty({ example: 2024 })
  @Column({ name: 'year', type: 'int' })
  year: number;

  @ApiProperty({ example: 'Prata' })
  @Column({ name: 'color', type: 'varchar', length: 60 })
  color: string;

  @ApiProperty({ example: '129900.90' })
  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @ApiProperty({ example: 1 })
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ApiProperty({ example: VehicleStatus.AVAILABLE, enum: VehicleStatus })
  @Column({ name: 'status', type: 'varchar', length: 30 })
  status: string;

  @ApiProperty({ example: '2026-07-15T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-15T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
