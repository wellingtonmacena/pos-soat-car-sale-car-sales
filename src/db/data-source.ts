import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Sale } from '../sales/entities/sale.entity';

config(); // Carrega as variáveis do arquivo .env

export const AppDataSource = new DataSource({
  type: 'postgres', // ou 'mysql', 'mariadb', etc.
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'car_sale',
  entities: [Vehicle, Sale],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Nunca use true em produção! Use migrations.
});

export async function getAppDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}
