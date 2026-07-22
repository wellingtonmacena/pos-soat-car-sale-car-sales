import { Injectable } from '@nestjs/common';
import { getAppDataSource } from '../../db/data-source';
import { Sale } from '../entities/sale.entity';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';

@Injectable()
export class SalesRepository {
  private async repository() {
    const dataSource = await getAppDataSource();

    return dataSource.getRepository(Sale);
  }

  async create(createSaleDto: CreateSaleDto) {
    const repository = await this.repository();

    return repository.save(repository.create(createSaleDto));
  }

  async findAll() {
    const repository = await this.repository();
    const orderValue = 'DESC' as const;

    return repository.find({
      order: {
        createdAt: orderValue,
      },
    });
  }

  async findOne(id: number) {
    const repository = await this.repository();

    return repository.findOneBy({ id });
  }

  async findByPaymentCode(paymentCode: string) {
    const repository = await this.repository();
    const orderValue = 'DESC' as const;

    return repository.find({
      where: { paymentOrderCode: paymentCode },
      order: {
        createdAt: orderValue,
      },
    });
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const repository = await this.repository();

    return repository.update(id, updateSaleDto);
  }

  async remove(id: number) {
    const repository = await this.repository();

    return repository.delete(id);
  }
}
