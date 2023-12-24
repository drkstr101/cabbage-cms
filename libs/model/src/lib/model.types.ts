export type Document = Config | Page;
export type DocumentTypeName = Config['type'] | Page['type'];

export type Section = CardsSection | HeroSection;

export type ModelKind = 'data' | 'object' | 'page';

/** Document types */
export type Config = {
  __metadata: { id: string };
  type: 'Config';
  favicon?: string;
  header?: Header;
  footer?: Footer;
};

export type Page = {
  __metadata: { id: string };
  slug: string;
  type: 'Page';
  title: string;
  sections?: Section[];
  content?: string;
};

/** Nested types */
export type Button = {
  type: 'Button';
  label: string;
  url: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'inherit' | 'primary' | 'secondary';
};

export type Card = {
  type: 'Card';
  title?: string;
  text?: string;
  image?: Image;
  actions?: Button[];
};

export type CardsSection = {
  type: 'CardsSection';
  title?: string;
  subtitle?: string;
  items?: Card[];
};

export type Footer = {
  type: 'Footer';
  copyrightText?: string;
  navLinks?: Link[];
};

export type Header = {
  type: 'Header';
  title?: string;
  navLinks?: Link[];
};

export type HeroSection = {
  type: 'HeroSection';
  title?: string;
  subtitle?: string;
  text?: string;
  actions?: Button[];
  image?: Image;
};

export type Image = {
  type: 'Image';
  url?: string;
  altText?: string;
};

export type Link = {
  type: 'Link';
  label: string;
  url: string;
  underline?: 'always' | 'hover' | 'none';
  color?: 'inherit' | 'primary' | 'secondary';
};
