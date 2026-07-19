import { Module } from '@nestjs/common';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SalesModule } from './sales/sales.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [VehiclesModule, SalesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
