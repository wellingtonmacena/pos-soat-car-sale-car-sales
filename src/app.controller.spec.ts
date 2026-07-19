import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: { getHealth: jest.Mock };

  beforeEach(async () => {
    appService = {
      getHealth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('delegates health check to service', () => {
    const result = { status: 'ok' };
    appService.getHealth.mockReturnValue(result);

    expect(controller.getHealth()).toBe(result);
    expect(appService.getHealth).toHaveBeenCalledTimes(1);
  });
});
