import MarkdownToJsx from 'markdown-to-jsx';
import { FC } from 'react';

export type MarkdownProps = { text: string; className?: string; 'data-sb-field-path'?: string };

export const Markdown: FC<MarkdownProps> = (props) => {
  const { text, className, 'data-sb-field-path': fieldPath } = props;

  return (
    <MarkdownToJsx
      options={{ forceBlock: true, forceWrapper: true }}
      className={className}
      data-sb-field-path={fieldPath}
    >
      {text}
    </MarkdownToJsx>
  );
};
