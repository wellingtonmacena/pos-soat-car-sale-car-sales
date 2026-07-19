import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { IsCpf } from '../../common/validators/is-cpf.validator';

export class CreateSaleDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  vehicleId: number;

  @ApiProperty({ example: '52998224725' })
  @IsCpf()
  buyerCpf: string;

  @ApiProperty({ example: '2026-07-15', required: false })
  @IsOptional()
  @IsDateString()
  saleDate?: string;
}
