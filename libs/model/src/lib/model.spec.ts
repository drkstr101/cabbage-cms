import modelsByName from './model';
import { ModelType } from './model.types';

describe('cabbage-cms.model', () => {
  it.each([
    'Button',
    'Card',
    'CardsSection',
    'Config',
    'Footer',
    'Header',
    'HeroSection',
    'Image',
    'Link',
    'MetaTag',
    'Page',
    'Seo',
    'ThemeConfig',
  ] as ModelType[])('MUST provide a %s model definition', (type) => {
    expect(modelsByName[type]).toHaveProperty('name', type);
  });
});
