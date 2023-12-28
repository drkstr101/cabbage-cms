/* eslint-disable @typescript-eslint/no-explicit-any */

// provide module def for javascript packages
declare module '@mapbox/rehype-prism';

// allow svg imports
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}
