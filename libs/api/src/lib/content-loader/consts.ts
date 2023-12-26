export { RICH_TEXT_NODE_TYPES, RICH_TEXT_MARK_TYPES, RICH_TEXT_HINT_MAX_LENGTH } from '@stackbit/types';

export const SIMPLE_VALUE_FIELDS = ['string', 'text', 'markdown', 'number', 'url', 'slug', 'boolean', 'date', 'datetime', 'color'];

export const LOADER_EXCLUDED_FILES = [
    'LICENSE.md',
    'README.md',
    'README.theme.md',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'stackbit.yaml',
    'netlify.toml',
    'theme.toml',
    'package.json',
    'package-lock.json',
    'yarn-lock.json'
];

export const LOADER_EXCLUDED_DIRS = ['src/pages'];
