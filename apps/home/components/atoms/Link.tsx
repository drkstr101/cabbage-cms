import { types } from '@cabbage-cms/model';
import NextLink from 'next/link';

import MuiLink from '@mui/material/Link';
import { SxProps, Theme } from '@mui/material/styles';
import { FC } from 'react';

export type LinkProps = types.LinkProps & {
  className?: string;
  sx?: SxProps<Theme>;
  'data-sb-field-path'?: string;
};

export const Link: FC<LinkProps> = (props) => {
  const {
    className,
    label,
    url,
    underline = 'always',
    color = 'primary',
    sx,
    'data-sb-field-path': fieldPath,
  } = props;
  const annotations = fieldPath ? [fieldPath, `${fieldPath}.url#@href`].join(' ').trim() : null;

  return (
    <MuiLink
      component={NextLink}
      href={url}
      className={className}
      underline={underline}
      color={color}
      sx={{ ...sx }}
      data-sb-field-path={annotations}
    >
      <span data-sb-field-path=".label">{label}</span>
    </MuiLink>
  );
};
