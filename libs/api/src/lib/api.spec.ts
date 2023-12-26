import { join } from 'path';
import { pagesByType, siteConfig } from './api';

// use our test fixtures as the workspace root
const workspaceRoot = join(__dirname, '../../test/fixtures');
const setupEnv = () => {
  process.env['CABBAGE_WORKSPACE'] = workspaceRoot;
};

describe('cabbage-cms.api/api', () => {
  beforeAll(setupEnv);
  describe('pagesByType', () => {
    const pages = pagesByType('Page');
    expect(pages).toBeInstanceOf(Object);
  });
  describe('siteConfig', () => {
    it('should work', async () => {
      const config = siteConfig();
      expect(config).toHaveProperty('__metadata', {
        id: 'content/data/config.json',
      });
    });
  });
});
