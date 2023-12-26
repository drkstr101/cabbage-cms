import type { CabbageModel } from './model.types';
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

export const modelsByName: CabbageModel = {
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
