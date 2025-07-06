import config from '../config';

describe('Config', () => {
  it('should have a baseRouterPrefix', () => {
    expect(config.baseRouterPrefix).toBeDefined();
  });

  it('should have a baseApiPrefix', () => {
    expect(config.baseApiPrefix).toBeDefined();
    expect(config.baseApiPrefix).toBe('/api/');
  });
});