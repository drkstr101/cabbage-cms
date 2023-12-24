import { Button } from './models/Button';
import { Card } from './models/Card';
import { CardsSection } from './models/CardsSection';
import { Config } from './models/Config';
import { Footer } from './models/Footer';
import { Header } from './models/Header';
import { HeroSection } from './models/HeroSection';
import { Image } from './models/Image';
import { Link } from './models/Link';
import { Page } from './models/Page';
import { ThemeStyle } from './models/ThemeStyle';

export const modelsByName = {
  Button,
  Card,
  CardsSection,
  Config,
  Footer,
  Header,
  HeroSection,
  Image,
  Link,
  Page,
  ThemeStyle,
} as const;

export type CabbageModel = typeof modelsByName;

export type AnyModel =
  | typeof Button
  | typeof Card
  | typeof CardsSection
  | typeof Config
  | typeof Footer
  | typeof Header
  | typeof HeroSection
  | typeof Image
  | typeof Link
  | typeof Page
  | typeof ThemeStyle;

export type ModelName = keyof typeof modelsByName;

export default modelsByName;
