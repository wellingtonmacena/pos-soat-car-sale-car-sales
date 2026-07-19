import { Injectable } from '@nestjs/common';
import { FindOptionsOrderValue } from 'typeorm';
import { getAppDataSource } from '../../db/data-source';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

export type VehicleSortField = 'createdAt' | 'price';

@Injectable()
export class VehiclesRepository {
  private async repository() {
    const dataSource = await getAppDataSource();

    return dataSource.getRepository(Vehicle);
  }

  async create(createVehicleDto: CreateVehicleDto) {
    const repository = await this.repository();

    return repository.save(repository.create(createVehicleDto));
  }

  async findAll(sortBy: VehicleSortField = 'createdAt', sortAsc = true) {
    const repository = await this.repository();
    const orderValue: FindOptionsOrderValue = sortAsc ? 'ASC' : 'DESC';

    return repository.find({
      order: {
        [sortBy]: orderValue,
      },
    });
  }

  async findOne(id: number) {
    const repository = await this.repository();

    return repository.findOneBy({ id });
  }

  async findByStatus(
    status: VehicleStatus,
    sortBy: VehicleSortField = 'price',
    sortAsc = true,
  ) {
    const repository = await this.repository();
    const orderValue: FindOptionsOrderValue = sortAsc ? 'ASC' : 'DESC';

    return repository.find({
      where: { status },
      order: {
        [sortBy]: orderValue,
      },
    });
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const repository = await this.repository();

    return repository.update(id, updateVehicleDto);
  }

  async remove(id: number) {
    const repository = await this.repository();

    return repository.delete(id);
  }
}
