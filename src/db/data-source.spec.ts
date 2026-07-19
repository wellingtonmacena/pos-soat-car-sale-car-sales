import { AppDataSource, getAppDataSource } from './data-source';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('data source', () => {
  beforeEach(() => {
    (AppDataSource as unknown as { isInitialized: boolean }).isInitialized =
      false;
    jest.clearAllMocks();
  });

  it('loads dotenv config on import', async () => {
    await jest.isolateModulesAsync(async () => {
      await import('./data-source');
    });

    const { config } = await import('dotenv');
    expect(config).toHaveBeenCalled();
  });

  it('initializes the data source when needed', async () => {
    const initialize = jest.fn().mockResolvedValue(undefined);
    (
      AppDataSource as unknown as {
        isInitialized: boolean;
        initialize: jest.Mock;
      }
    ).initialize = initialize;

    await getAppDataSource();

    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('returns the existing data source without reinitializing', async () => {
    const initialize = jest.fn().mockResolvedValue(undefined);
    (
      AppDataSource as unknown as {
        isInitialized: boolean;
        initialize: jest.Mock;
      }
    ).initialize = initialize;
    (AppDataSource as unknown as { isInitialized: boolean }).isInitialized =
      true;

    await getAppDataSource();

    expect(initialize).not.toHaveBeenCalled();
  });
});
