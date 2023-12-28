import { DataModel } from '@stackbit/types';

export const ThemeConfig: DataModel = {
  type: 'data',
  name: 'ThemeConfig',
  label: 'Theme Style',
  singleInstance: true,
  filePath: 'content/data/style.json',
  readOnly: true,
  fields: [
    {
      type: 'enum',
      name: 'mode',
      label: 'Mode',
      controlType: 'button-group',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
      default: 'light',
    },
    { type: 'color', name: 'primaryColor', label: 'Primary color', default: '#14b8a6' },
    {
      type: 'color',
      name: 'secondaryColor',
      label: 'Secondary color',
      default: '#6366f1',
    },
  ],
};
