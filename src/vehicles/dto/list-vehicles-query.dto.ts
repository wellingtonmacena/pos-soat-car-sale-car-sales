import { VehicleSortField } from '../repositories/vehicles.repository';

export class ListVehiclesQueryDto {
  sortBy?: VehicleSortField;
  sortAsc?: string;
}
