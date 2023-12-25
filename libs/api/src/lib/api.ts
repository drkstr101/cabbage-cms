import type { types } from '@cabbage-cms/model';
import { glob } from 'fast-glob';
import { readFileSync } from 'fs';
import matter from 'gray-matter';
import { extname } from 'path';

// TODO - we should find a better way to do this
// eslint-disable-next-line @nx/enforce-module-boundaries
import { rootPath } from 'workspace.config';

export const dataDir = 'content/data';
export const pagesDir = 'content/pages';
export const siteConfigFile = dataDir + '/config.json';

const supportedFileTypes = ['md', 'json'];

function contentFilesInPath(dir: string) {
  const globPattern = `${dir}/**/*.{${supportedFileTypes.join(',')}}`;
  return glob.sync(globPattern, { cwd: rootPath });
}

function readContent(file: string): types.IDocumentProps | types.IPageProps {
  const rawContent = readFileSync(file, 'utf8');
  let content = null;
  switch (extname(file).substring(1)) {
    case 'md':
      content = matter(rawContent);
      break;
    case 'json':
      content = JSON.parse(rawContent);
      break;
    default:
      throw Error(`Unhandled file type: ${file}`);
  }

  return {
    __metadata: { id: file, url: fileToUrl(file) },
    ...content,
  };
}

function fileToUrl(file: string): string | undefined {
  if (!file.startsWith(pagesDir)) return void 0;

  let url = file.slice(pagesDir.length);
  url = url.split('.')[0];
  if (url.endsWith('/index')) {
    url = url.slice(0, -6) || '/';
  }
  return url;
}

function urlToFilePairs() {
  const pageFiles = contentFilesInPath(pagesDir);
  return pageFiles.map((file) => [fileToUrl(file), file]);
}

export function urlToContent(url: string) {
  const urlToFile = Object.fromEntries(urlToFilePairs());
  const file = urlToFile[url];
  return readContent(file);
}

export function pagesByType(contentType: types.PageType) {
  const result: Record<string, types.IPageProps> = {};
  for (const [url, file] of urlToFilePairs()) {
    if (file) {
      const content = readContent(file);
      if (url && content.type === contentType) result[url] = content;
    }
  }
  return result;
}

export function siteConfig() {
  return readContent(siteConfigFile) as types.ConfigProps;
}
