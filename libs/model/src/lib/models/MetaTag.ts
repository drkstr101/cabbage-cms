import { ObjectModel } from '@stackbit/types';

export const MetaTag: ObjectModel = {
  type: 'object',
  name: 'MetaTag',
  label: 'Meta Tag',
  labelField: 'content',
  fields: [
    {
      type: 'enum',
      name: 'property',
      label: 'Property',
      required: true,
      hidden: false,
      localized: false,
      options: [
        'og:title',
        'og:type',
        'og:image',
        'og:image:alt',
        'og:url',
        'og:description',
        'og:locale',
        'og:site_name',
        'og:video',
        'twitter:card',
        'twitter:site',
        'twitter:creator',
        'twitter:description',
        'twitter:title',
        'twitter:image',
        'twitter:image:alt',
        'twitter:player',
      ],
    },
    {
      type: 'string',
      name: 'content',
      label: 'Content',
      required: true,
      hidden: false,
      localized: false,
    },
  ],
};
