import modelsByName, { ModelName } from './model';

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
    'ThemeStyle',
  ])('MUST provide a %s content model', (name) => {
    expect(modelsByName[name as ModelName]).toHaveProperty('name', name);
  });
});
