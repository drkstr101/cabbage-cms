import { GitContentSource } from '@stackbit/cms-git';
import { defineStackbitConfig } from '@stackbit/types';
import { modelsByName } from './libs/model/src/lib/model';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'nextjs',
  nodeVersion: '18',
  dataDir: 'content/data',
  pagesDir: 'content/pages',
  devCommand: './node_modules/.bin/nx run home:serve:development --port {PORT}',
  installCommand: 'yarn install',
  models: modelsByName,
  pageLayoutKey: 'layout',
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ['content/data', 'content/pages'],
      models: Object.values(modelsByName),
      assetsConfig: {
        referenceType: 'static',
        staticDir: 'apps/home/public',
        uploadDir: 'images',
        publicPath: '/',
      },
    }),
  ],
  presetSource: {
    type: 'files',
    presetDirs: ['content/presets'],
  },
  styleObjectModelName: 'ThemeConfig',
});
