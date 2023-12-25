import { pagesByType, siteConfig } from './api';

describe('cabbage-cms.api', () => {
  describe('pagesByType', () => {
    const pages = pagesByType('Page');
    expect(pages).toBeInstanceOf(Object);
  });
  describe('siteConfig', () => {
    it('should work', async () => {
      const config = siteConfig();
      expect(config).toBeTruthy();
    });
  });
});
