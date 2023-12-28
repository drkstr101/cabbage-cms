import type { types } from '@cabbage-cms/model';
import { glob } from 'fast-glob';
import { readFileSync } from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { workspacePath } from './utils';

export const dataDir = 'content/data';
export const pagesDir = 'content/pages';
export const siteConfigFile = dataDir + '/config.json';

const supportedFileTypes = ['md', 'json'];

function contentFilesInPath(dir: string) {
  const globPattern = `${dir}/**/*.{${supportedFileTypes.join(',')}}`;
  return glob.sync(globPattern, { cwd: workspacePath() });
}

function readContent(relFilePath: string): types.IDocumentProps | types.IPageProps {
  const rawContent = readFileSync(workspacePath(relFilePath), 'utf8');
  let result = null;
  switch (path.extname(relFilePath).substring(1)) {
    case 'md':
      // eslint-disable-next-line no-case-declarations
      const { content, data, excerpt } = matter(rawContent);
      result = { content, ...data, excerpt };
      break;
    case 'json':
      result = JSON.parse(rawContent);
      break;
    default:
      throw Error(`Unsupported file type found at: ${relFilePath}`);
  }

  return {
    __metadata: { id: relFilePath, url: fileToUrl(relFilePath) },
    ...result,
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

export function pagesBySlug(contentType: types.PageType) {
  const result: Record<string, types.IPageProps> = {};
  const urlFilePairs = urlToFilePairs();
  for (const [url, file] of urlFilePairs) {
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
