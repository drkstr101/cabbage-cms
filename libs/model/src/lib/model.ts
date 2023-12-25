import { Model } from '@stackbit/types';
import { ModelType } from './model.types';
import {
  Button,
  Card,
  CardsSection,
  Config,
  Footer,
  Header,
  HeroSection,
  Image,
  Link,
  MetaTag,
  Page,
  Seo,
  ThemeConfig,
} from './models';

export const modelsByName: Record<ModelType, Model> = {
  Button,
  Card,
  CardsSection,
  Config,
  Footer,
  Header,
  HeroSection,
  Image,
  Link,
  MetaTag,
  Page,
  Seo,
  ThemeConfig,
} as const;

export default modelsByName;
