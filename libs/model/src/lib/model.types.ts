export type IModelProps =
  | ButtonProps
  | CardProps
  | CardsSectionProps
  | ConfigProps
  | FooterProps
  | HeaderProps
  | HeroSectionProps
  | ImageProps
  | LinkProps
  | MetaTagProps
  | PageProps
  | SeoProps
  | ThemeConfigProps;
export type ModelType = IModelProps['type'];

//
// Document types
//
////////////////////////

export type IDocumentProps = ConfigProps | ThemeConfigProps;
export type DocumentType = IDocumentProps['type'];

export type ConfigProps = {
  __metadata: { id: string };
  type: 'Config';
  favicon?: string;
  header?: HeaderProps;
  footer?: FooterProps;
};

export type ThemeConfigProps = {
  __metadata: { id: string };
  type: 'ThemeConfig';
  mode?: 'light' | 'dark';
  primaryColor?: string;
  secondaryColor?: string;
};

//
// Page types
//
////////////////////////

export type IPageProps = PageProps;
export type PageType = IPageProps['type'];

export type ISection = CardsSectionProps | HeroSectionProps;
export type SectionType = ISection['type'];

export type PageProps = {
  __metadata: { id: string; slug: string };
  type: 'Page';
  title: string;
  sections?: ISection[];
  content?: string;
};

//
// Block types
//
////////////////////////

export type HeroSectionProps = {
  type: 'HeroSection';
  title?: string;
  subtitle?: string;
  text?: string;
  actions?: ButtonProps[];
  image?: ImageProps;
};

export type CardsSectionProps = {
  type: 'CardsSection';
  title?: string;
  subtitle?: string;
  items?: CardProps[];
};

//
// Object types
//
////////////////////////

export type SeoProps = {
  type: 'Seo';
  metaTitle?: string;
  metaDescription: string;
};

export type MetaTagProps = {
  type: 'MetaTag';
  property:
    | 'og:title'
    | 'og:type'
    | 'og:image'
    | 'og:image:alt'
    | 'og:url'
    | 'og:description'
    | 'og:locale'
    | 'og:site_name'
    | 'og:video'
    | 'twitter:card'
    | 'twitter:site'
    | 'twitter:creator'
    | 'twitter:description'
    | 'twitter:title'
    | 'twitter:image'
    | 'twitter:image:alt'
    | 'twitter:player';
  content: string;
};

export type ButtonProps = {
  type: 'Button';
  label: string;
  url: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'inherit' | 'primary' | 'secondary';
};

export type CardProps = {
  type: 'Card';
  title?: string;
  text?: string;
  image?: ImageProps;
  actions?: ButtonProps[];
};

export type FooterProps = {
  type: 'Footer';
  copyrightText?: string;
  navLinks?: LinkProps[];
};

export type HeaderProps = {
  type: 'Header';
  title?: string;
  navLinks?: LinkProps[];
};

export type ImageProps = {
  type: 'Image';
  url?: string;
  altText?: string;
};

export type LinkProps = {
  type: 'Link';
  label: string;
  url: string;
  underline?: 'always' | 'hover' | 'none';
  color?: 'inherit' | 'primary' | 'secondary';
};
