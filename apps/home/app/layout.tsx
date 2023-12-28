import * as React from 'react';

import ThemeProvider from '../components/theme-provider';

export const metadata = {
  title: 'Cabbage CMS | A content-driven layered CMS for Next.js and more',
  description:
    'Cabbage CMS empowers non-technical editors to make structural changes to a website without the help of a developer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
