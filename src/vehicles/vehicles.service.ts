import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  VehiclesRepository,
  VehicleSortField,
} from './repositories/vehicles.repository';
import { VehicleStatus } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(private readonly vehiclesRepository: VehiclesRepository) {}

  create(createVehicleDto: CreateVehicleDto) {
    return this.vehiclesRepository.create(createVehicleDto);
  }

  findAll(sortBy?: VehicleSortField, sortAsc?: boolean) {
    return this.vehiclesRepository.findAll(sortBy, sortAsc);
  }

  findOne(id: number) {
    return this.vehiclesRepository.findOne(id);
  }

  findForSale() {
    return this.vehiclesRepository.findByStatus(
      VehicleStatus.AVAILABLE,
      'price',
      true,
    );
  }

  findSold() {
    return this.vehiclesRepository.findByStatus(
      VehicleStatus.SOLD,
      'price',
      true,
    );
  }

  update(id: number, updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesRepository.update(id, updateVehicleDto);
  }

  remove(id: number) {
    return this.vehiclesRepository.remove(id);
  }
}
