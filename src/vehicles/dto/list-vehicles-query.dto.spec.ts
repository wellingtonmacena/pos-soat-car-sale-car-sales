import { ListVehiclesQueryDto } from './list-vehicles-query.dto';

describe('ListVehiclesQueryDto', () => {
  it('creates an empty query dto', () => {
    const dto = new ListVehiclesQueryDto();

    expect(dto).toBeInstanceOf(ListVehiclesQueryDto);
    expect(dto.sortBy).toBeUndefined();
    expect(dto.sortAsc).toBeUndefined();
  });
});
