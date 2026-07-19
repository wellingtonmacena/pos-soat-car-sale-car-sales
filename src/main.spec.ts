import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getAppDataSource } from './db/data-source';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
  const actual = jest.requireActual('@nestjs/swagger');

  return {
    ...actual,
    DocumentBuilder: jest.fn(),
    SwaggerModule: {
      ...actual.SwaggerModule,
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
  };
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
});

jest.mock('./db/data-source', () => ({
  getAppDataSource: jest.fn().mockResolvedValue(undefined),
}));

describe('bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PORT = '4567';
  });

  it('initializes the app and swagger docs', async () => {
    const listenMock = jest.fn().mockResolvedValue(undefined);
    const useGlobalPipesMock = jest.fn();
    const swaggerBuilderMock = {
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addTag: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue({
      listen: listenMock,
      useGlobalPipes: useGlobalPipesMock,
    });
    (DocumentBuilder as unknown as jest.Mock).mockImplementation(
      () => swaggerBuilderMock,
    );
    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({});

    await jest.isolateModulesAsync(async () => {
      await import('./main');
    });

    expect(getAppDataSource).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    const createCalls = (NestFactory.create as jest.Mock).mock.calls as {
      name: string;
    }[][];
    expect(createCalls[0][0].name).toBe(AppModule.name);
    expect(DocumentBuilder).toHaveBeenCalledTimes(1);
    expect(swaggerBuilderMock.setTitle).toHaveBeenCalledWith(
      'Pos Soat Car Sale API',
    );
    expect(swaggerBuilderMock.setDescription).toHaveBeenCalledWith(
      'API documentation for the car listing project',
    );
    expect(swaggerBuilderMock.setVersion).toHaveBeenCalledWith('1.0');
    expect(swaggerBuilderMock.addTag).toHaveBeenCalledWith('vehicles');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SwaggerModule.createDocument).toHaveBeenCalledTimes(1);
    expect(useGlobalPipesMock).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api/docs',
      { listen: listenMock, useGlobalPipes: useGlobalPipesMock },
      {},
    );
    expect(listenMock).toHaveBeenCalledWith('4567');
  });
});
