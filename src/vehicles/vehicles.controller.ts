import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleSortField } from './repositories/vehicles.repository';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vehicle' })
  @ApiBody({ type: CreateVehicleDto })
  @ApiResponse({ status: 201, description: 'Vehicle created' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List vehicles' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'price'] })
  @ApiQuery({ name: 'sortAsc', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Vehicles list' })
  findAll(
    @Query('sortBy') sortBy?: VehicleSortField,
    @Query('sortAsc') sortAsc?: string,
  ) {
    const normalizedSortBy = sortBy === 'price' ? 'price' : 'createdAt';
    const normalizedSortAsc = sortAsc === 'false' ? false : true;

    return this.vehiclesService.findAll(normalizedSortBy, normalizedSortAsc);
  }

  @Get('for-sale')
  @ApiOperation({ summary: 'List vehicles available for sale' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles with status=available, sorted by price ascending',
  })
  findForSale() {
    return this.vehiclesService.findForSale();
  }

  @Get('sold')
  @ApiOperation({ summary: 'List sold vehicles' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles with status=sold, sorted by price ascending',
  })
  findSold() {
    return this.vehiclesService.findSold();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle by id' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateVehicleDto })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}
