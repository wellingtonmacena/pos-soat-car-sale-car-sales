import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Post('admin/reset-to-migrations')
  @ApiOperation({
    summary: 'Reset database to latest migration version',
  })
  @ApiResponse({
    status: 201,
    description:
      'Drops current data and reapplies migrations to restore baseline state',
  })
  resetToMigrations() {
    return this.appService.resetToLatestMigrations();
  }
}
