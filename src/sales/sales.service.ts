import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { EntityManager } from 'typeorm';
import { getAppDataSource } from '../db/data-source';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PaymentStatus } from './dto/update-payment-status.dto';
import { SalesRepository } from './repositories/sales.repository';
import { Sale, SaleStatus } from './entities/sale.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async create(createSaleDto: CreateSaleDto) {
    const dataSource = await getAppDataSource();

    return dataSource.transaction(async (manager: EntityManager) => {
      const vehicleRepository = manager.getRepository(Vehicle);
      const saleRepository = manager.getRepository(Sale);

      const vehicle = await vehicleRepository.findOneBy({
        id: createSaleDto.vehicleId,
      });

      if (!vehicle) {
        throw new BadRequestException('vehicleId does not exist');
      }

      if (vehicle.status !== (VehicleStatus.AVAILABLE as string)) {
        throw new ConflictException('Vehicle is not available for sale');
      }

      const totalPrice = vehicle.price;

      let sale = await saleRepository.save(
        saleRepository.create({
          vehicleId: vehicle.id,
          buyerCpf: createSaleDto.buyerCpf,
          saleDate:
            createSaleDto.saleDate ?? new Date().toISOString().slice(0, 10),
          totalPrice,
          status: SaleStatus.PENDING_PAYMENT,
          paymentOrderCode: null,
        }),
      );

      vehicle.status = VehicleStatus.RESERVED;
      await vehicleRepository.save(vehicle);

      const paymentOrderServiceUrl = process.env.PAYMENT_ORDER_SERVICE_URL;

      if (!paymentOrderServiceUrl) {
        throw new ServiceUnavailableException(
          'PAYMENT_ORDER_SERVICE_URL is not configured',
        );
      }

      // Expected contract for the core service's payment-order creation
      // endpoint: it receives { saleId, status? } and responds with a
      // body shaped like { paymentCode: string, ... }. We read paymentCode
      // defensively in case the response shape differs slightly.
      let paymentCode: string | null = null;

      try {
        const response = await axios.post<{ paymentCode?: string }>(
          paymentOrderServiceUrl,
          {
            saleId: sale.id,
          },
        );

        paymentCode = response?.data?.paymentCode ?? null;
      } catch {
        throw new ServiceUnavailableException(
          'Unable to create payment order in external service',
        );
      }

      sale.paymentOrderCode = paymentCode;
      sale = await saleRepository.save(sale);

      return sale;
    });
  }

  findAll() {
    return this.salesRepository.findAll();
  }

  findByPaymentCode(paymentCode: string) {
    return this.salesRepository.findByPaymentCode(paymentCode);
  }

  findOne(id: number) {
    return this.salesRepository.findOne(id);
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return this.salesRepository.update(id, updateSaleDto);
  }

  async updatePaymentStatus(id: number, status: PaymentStatus) {
    const dataSource = await getAppDataSource();

    return dataSource.transaction(async (manager: EntityManager) => {
      const saleRepository = manager.getRepository(Sale);
      const vehicleRepository = manager.getRepository(Vehicle);

      const sale = await saleRepository.findOneBy({ id });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      const vehicle = await vehicleRepository.findOneBy({
        id: sale.vehicleId,
      });

      if (!vehicle) {
        throw new BadRequestException('vehicleId does not exist');
      }

      if (status === 'completed') {
        sale.status = SaleStatus.COMPLETED;
        vehicle.status = VehicleStatus.SOLD;
      } else {
        sale.status = SaleStatus.CANCELLED;
        vehicle.status = VehicleStatus.AVAILABLE;
      }

      await vehicleRepository.save(vehicle);

      return saleRepository.save(sale);
    });
  }

  remove(id: number) {
    return this.salesRepository.remove(id);
  }
}
