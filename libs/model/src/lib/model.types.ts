export type IDocument = ConfigModel | PageModel;
export type IPage = PageModel;
export type IDocumentType = IDocument['type'];

export type ISection = CardsSectionModel | HeroSectionModel;

/** Data (document) types */
export type ConfigModel = {
  __metadata: { id: string };
  type: 'Config';
  favicon?: string;
  header?: HeaderModel;
  footer?: FooterModel;
};

/** Page (document) types */

export type PageModel = {
  __metadata: { id: string; slug: string };
  type: 'Page';
  title: string;
  sections?: ISection[];
  content?: string;
};

/** Nested (object) types */
export type ButtonModel = {
  type: 'Button';
  label: string;
  url: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'inherit' | 'primary' | 'secondary';
};

export type CardModel = {
  type: 'Card';
  title?: string;
  text?: string;
  image?: ImageModel;
  actions?: ButtonModel[];
};

export type CardsSectionModel = {
  type: 'CardsSection';
  title?: string;
  subtitle?: string;
  items?: CardModel[];
};

export type FooterModel = {
  type: 'Footer';
  copyrightText?: string;
  navLinks?: LinkModel[];
};

export type HeaderModel = {
  type: 'Header';
  title?: string;
  navLinks?: LinkModel[];
};

export type HeroSectionModel = {
  type: 'HeroSection';
  title?: string;
  subtitle?: string;
  text?: string;
  actions?: ButtonModel[];
  image?: ImageModel;
};

export type ImageModel = {
  type: 'Image';
  url?: string;
  altText?: string;
};

export type LinkModel = {
  type: 'Link';
  label: string;
  url: string;
  underline?: 'always' | 'hover' | 'none';
  color?: 'inherit' | 'primary' | 'secondary';
};
