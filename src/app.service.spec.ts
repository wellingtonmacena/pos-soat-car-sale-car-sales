import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('returns an ok health status', () => {
    expect(service.getHealth()).toEqual({ status: 'ok' });
  });
});
