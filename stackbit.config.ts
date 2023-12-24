import { GitContentSource } from '@stackbit/cms-git';
import { defineStackbitConfig } from '@stackbit/types';
import { modelsByName } from './libs/model/src/lib/model';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'nextjs',
  nodeVersion: '20',
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
  styleObjectModelName: 'ThemeStyle',
});
