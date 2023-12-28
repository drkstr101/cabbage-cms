//@ts-check

import rehypePrism from '@mapbox/rehype-prism';
import nextMDX from '@next/mdx';
import { composePlugins, withNx } from '@nx/next';
import remarkGfm from 'remark-gfm';

const withMdx = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  env: {
    // inject the workspace location here as it is more deterministic than relying on dist/source layout of the project
    CABBAGE_WORKSPACE: new URL('../..', import.meta.url).pathname,
  },
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withMdx,
];

export default composePlugins(...plugins)(nextConfig);
