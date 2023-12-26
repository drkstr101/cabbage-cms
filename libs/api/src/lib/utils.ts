/**
 * Resolving the root workspace location is non-deterministic in some cases, so it is best
 * to grab it from an env variable if possible. First we attempt to resolve the path from
 * environment variables (`CABBAGE_WORKSPACE`, `GITHUB_WORKSPACE`, `GITPOD_REPO_ROOT`),
 * finally falling back on the CWD.
 *
 * `WORKSPACE_DIR`,
 * @returns Absolute path to the project root
 */
export function workspaceRoot(): string {
  return (
    process.env['CABBAGE_WORKSPACE'] ||
    process.env['GITHUB_WORKSPACE'] ||
    process.env['GITPOD_REPO_ROOT'] ||
    process.cwd()
  );
}
