import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { VehicleStatus } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 'Prata' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: '129900.90' })
  @IsNumberString()
  price: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: VehicleStatus.AVAILABLE,
    enum: VehicleStatus,
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VehicleStatus))
  status?: VehicleStatus;
}
