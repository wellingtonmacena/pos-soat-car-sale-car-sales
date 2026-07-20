import { Injectable } from '@nestjs/common';
import { getAppDataSource } from './db/data-source';

@Injectable()
export class AppService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  async resetToLatestMigrations(): Promise<{
    status: string;
    message: string;
    migrationsExecuted: number;
  }> {
    const dataSource = await getAppDataSource();

    await dataSource.dropDatabase();
    const migrations = await dataSource.runMigrations();

    return {
      status: 'ok',
      message: 'Database reset to latest migrations',
      migrationsExecuted: migrations.length,
    };
  }
}
