import trim from 'lodash/trim';
import { join, sep } from 'path';

/**
 * This function resolves a path or multiple path segments relative to the workspace root.
 * If no path segments are provided the workspace root itself is provided. All path
 * separators are stripped before joining. Resolving the root workspace location is
 * non-deterministic in some cases, so it is best to grab it from an env variable if possible. First we attempt to resolve the path from
 * environment variables (`CABBAGE_WORKSPACE`, `GITHUB_WORKSPACE`, `GITPOD_REPO_ROOT`),
 * finally falling back on the CWD.
 *
 * @returns Absolute path to the project root
 */
export function workspacePath(...paths: string[]): string {
  const rootDir =
    process.env['CABBAGE_WORKSPACE'] ||
    process.env['GITHUB_WORKSPACE'] ||
    process.env['GITPOD_REPO_ROOT'] ||
    process.cwd();

  return join(rootDir, ...paths.map((it) => trim(it, sep)));
}
