import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateVehiclesTables1484164764431 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'model',
            type: 'varchar',
            length: '150',
          },
          {
            name: 'year',
            type: 'int',
          },
          {
            name: 'color',
            type: 'varchar',
            length: '60',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '30',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            onUpdate: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vehicles');
  }
}
