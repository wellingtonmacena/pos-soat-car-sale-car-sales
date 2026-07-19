import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1800000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vehicles (id, brand, model, year, color, price, user_id, status, created_at, updated_at)
      VALUES
        (1, 'Toyota', 'Corolla', 2024, 'Prata', 129900.90, 1, 'sold', NOW(), NOW()),
        (2, 'Honda', 'Civic', 2023, 'Preto', 139900.90, 2, 'reserved', NOW(), NOW())
    `);

    await queryRunner.query(`
      INSERT INTO sales (id, vehicle_id, buyer_cpf, sale_date, total_price, payment_order_code, status, created_at, updated_at)
      VALUES
        (1, 1, '52998224725', CURRENT_DATE, 129900.90, 'PAY-SEED-0001', 'completed', NOW(), NOW()),
        (2, 2, '11144477735', CURRENT_DATE, 139900.90, 'PAY-SEED-0002', 'pending_payment', NOW(), NOW())
    `);

    await queryRunner.query(`
      SELECT setval(pg_get_serial_sequence('vehicles', 'id'), (SELECT COALESCE(MAX(id), 1) FROM vehicles))
    `);

    await queryRunner.query(`
      SELECT setval(pg_get_serial_sequence('sales', 'id'), (SELECT COALESCE(MAX(id), 1) FROM sales))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM sales WHERE id IN (1, 2)`);
    await queryRunner.query(`DELETE FROM vehicles WHERE id IN (1, 2)`);
  }
}
