import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMoreData1800000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vehicles (id, brand, model, year, color, price, user_id, status, created_at, updated_at)
      VALUES
        (3, 'Chevrolet', 'Onix', 2022, 'Branco', 82990.00, 3, 'available', NOW(), NOW()),
        (4, 'Volkswagen', 'T-Cross', 2024, 'Cinza', 149990.00, 4, 'reserved', NOW(), NOW()),
        (5, 'Hyundai', 'HB20', 2021, 'Vermelho', 75990.00, 5, 'sold', NOW(), NOW()),
        (6, 'Jeep', 'Compass', 2023, 'Azul', 120000.00, 6, 'available', NOW(), NOW()),
        (7, 'BYD', 'Song Plus', 2026, 'Azul', 78888.00, 6, 'available', NOW(), NOW()),
        (8, 'Fiat', 'Argo', 2020, 'Prata', 200000.00, 6, 'available', NOW(), NOW()),
        (9, 'Hyundai', 'HB20', 2024, 'Azul', 90000.00, 6, 'available', NOW(), NOW())
    `);

    await queryRunner.query(`
      INSERT INTO sales (id, vehicle_id, buyer_cpf, sale_date, total_price, payment_order_code, status, created_at, updated_at)
      VALUES
        (3, 5, '39053344705', CURRENT_DATE - INTERVAL '10 days', 75990.00, 'PAY-SEED-0003', 'completed', NOW(), NOW()),
        (4, 4, '98765432100', CURRENT_DATE - INTERVAL '2 days', 149990.00, 'PAY-SEED-0004', 'pending_payment', NOW(), NOW()),
        (5, 2, '23982749859', CURRENT_DATE - INTERVAL '1 day', 139900.90, NULL, 'cancelled', NOW(), NOW())
    `);

    await queryRunner.query(`
      SELECT setval(pg_get_serial_sequence('vehicles', 'id'), (SELECT COALESCE(MAX(id), 1) FROM vehicles))
    `);

    await queryRunner.query(`
      SELECT setval(pg_get_serial_sequence('sales', 'id'), (SELECT COALESCE(MAX(id), 1) FROM sales))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM sales WHERE id IN (3, 4, 5)`);
    await queryRunner.query(`DELETE FROM vehicles WHERE id IN (3, 4, 5, 6)`);
  }
}
