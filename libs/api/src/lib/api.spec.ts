import { join } from 'path';
import { pagesBySlug, siteConfig } from './api';

// use our test fixtures as the workspace root
const workspaceRoot = join(__dirname, '../../test/fixtures');
const setupEnv = () => {
  process.env['CABBAGE_WORKSPACE'] = workspaceRoot;
};

describe('cabbage-cms.api/api', () => {
  beforeAll(setupEnv);
  describe('pagesBySlug', () => {
    it('SHOULD group all page entries by their slug value', () => {
      const pages = pagesBySlug('Page');
      expect(Object.keys(pages).sort()).toEqual(['/', '/about']);
    });
  });
  describe('siteConfig', () => {
    it('resolves a single document that matches the `Config` type', async () => {
      const config = siteConfig();
      expect(config).toHaveProperty('__metadata', {
        id: 'content/data/config.json',
      });
    });
  });
});
