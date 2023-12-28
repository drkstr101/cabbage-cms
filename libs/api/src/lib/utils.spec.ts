import { resolve } from 'path';
import { workspacePath } from './utils';

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
      'resolves the workspace root from the %s environment variable',
      (name) => {
        process.env[name] = fixturesPath;
        const result = workspacePath();
        expect(result).toEqual(fixturesPath);
      }
    );

    it('resolves the workspace root from CWD', async () => {
      const result = workspacePath();
      expect(result).toEqual(process.cwd());
    });

    it('combines multiple path segments while trimming the path separator', () => {
      process.env['CABBAGE_WORKSPACE'] = '/tmp';
      expect(workspacePath('foo', '//bar/', '')).toEqual('/tmp/foo/bar');
    });
  });
});
