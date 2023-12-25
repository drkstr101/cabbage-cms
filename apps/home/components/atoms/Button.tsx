import { types } from '@cabbage-cms/model';
import NextLink from 'next/link';

import MuiButton from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';
import { FC } from 'react';

export type ButtonProps = types.ButtonProps & {
  className?: string;
  sx?: SxProps<Theme>;
  'data-sb-field-path'?: string;
};

export const Button: FC<ButtonProps> = (props) => {
  const {
    className,
    label,
    url,
    size = 'medium',
    variant = 'text',
    color = 'primary',
    sx,
    'data-sb-field-path': fieldPath,
  } = props;
  const annotations = fieldPath ? [fieldPath, `${fieldPath}.url#@href`].join(' ').trim() : null;

  return (
    <MuiButton
      component={NextLink}
      href={url}
      className={className}
      variant={variant}
      size={size}
      color={color}
      sx={{ borderRadius: '2px', ...sx }}
      data-sb-field-path={annotations}
    >
      <span data-sb-field-path=".label">{label}</span>
    </MuiButton>
  );
};
