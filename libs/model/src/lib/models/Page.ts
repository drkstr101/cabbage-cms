import { PageModel } from '@stackbit/types';
import { CardsSection } from './CardsSection';
import { HeroSection } from './HeroSection';
import { Seo } from './Seo';

export const Page: PageModel = {
  type: 'page',
  name: 'Page',
  label: 'Page',
  urlPath: '/{slug}',
  filePath: 'content/pages/{slug}.md',
  hideContent: true,
  thumbnail: 'https://assets.stackbit.com/components/models/thumbnails/default.png',
  fieldGroups: [
    {
      name: 'seo',
      label: 'SEO',
      icon: 'page',
    },
  ],
  fields: [
    {
      type: 'model',
      name: 'seo',
      label: 'SEO',
      required: false,
      hidden: false,
      localized: false,
      models: [Seo.name],
      group: 'seo',
    },
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      default: 'This is a New Page',
      required: true,
    },
    {
      type: 'list',
      name: 'sections',
      label: 'Sections',
      items: {
        type: 'model',
        models: [HeroSection.name, CardsSection.name],
        groups: ['sectionComponent'],
      },
      default: [
        {
          type: 'HeroSection',
          title: 'This Is A Big Hero Headline',
          text: 'Aenean eros ipsum, interdum quis dignissim non, sollicitudin vitae nisl. Aenean vel aliquet elit, at blandit ipsum. Sed eleifend felis sit amet erat molestie, hendrerit malesuada justo ultrices. Nunc volutpat at erat itae interdum. Ut nec massa eget lorem blandit condimentum et at risus.\n',
          actions: [
            {
              type: 'Button',
              label: 'Get Started',
              url: '/',
              size: 'large',
              variant: 'contained',
            },
            { type: 'Button', label: 'Learn more', url: '/', size: 'large', variant: 'outlined' },
          ],
          image: {
            type: 'Image',
            url: 'https://assets.stackbit.com/components/images/default/hero.png',
            altText: 'Hero section image',
          },
        },
      ],
    },
  ],
};
