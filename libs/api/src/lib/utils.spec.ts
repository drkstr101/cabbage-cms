import { resolve } from 'path';
import { workspaceRoot } from './utils';

const fixturesPath = resolve(__dirname, '../../test/fixtures');

const resetEnv = () => {
  // clear out existing env vars
  delete process.env['CABBAGE_WORKSPACE'];
  delete process.env['GITHUB_WORKSPACE'];
  delete process.env['GITPOD_REPO_ROOT'];
};

describe('cabbage-cms.api/utils', () => {
  describe('workspaceRoot()', () => {
    afterEach(resetEnv);
    beforeEach(resetEnv);
    it.each(['CABBAGE_WORKSPACE', 'GITHUB_WORKSPACE', 'GITPOD_REPO_ROOT'])(
      'MAY resolve the workspace root from the %s environment variable',
      (name) => {
        process.env[name] = fixturesPath;
        const result = workspaceRoot();
        expect(result).toEqual(fixturesPath);
      }
    );
    it('MAY resolve the workspace root from CWD', async () => {
      const result = workspaceRoot();
      expect(result).toEqual(process.cwd());
    });
  });
});
