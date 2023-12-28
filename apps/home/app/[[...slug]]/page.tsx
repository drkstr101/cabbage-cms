import { pagesBySlug, siteConfig, urlToContent } from '@cabbage-cms/api';
import { types } from '@cabbage-cms/model';
import trim from 'lodash/trim';

import { Box, Container } from '@mui/material';
import { DynamicComponent } from '../../components/DynamicComponent';
import { Footer } from '../../components/sections/Footer';
import { Header } from '../../components/sections/Header';

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  // get a list of all url paths and map them into string segments split by '/
  // Examples:
  // / = []
  // /about = ['about']
  // /articles/00-hello-world = ['articles', '00-hello-world']
  return Object.keys(pagesBySlug('Page')).map((it) => {
    return { slug: trim(it, '/').split('/') };
  });
}

async function getData({ slug }: { slug?: string[] }): Promise<{
  page: types.IPageProps;
  site: types.ConfigProps;
}> {
  const url = '/' + (slug ?? []).join('/');
  const page = urlToContent(url) as types.IPageProps;
  return { page, site: siteConfig() };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page({ params }: { params: { slug?: string[] } }) {
  const { page, site } = await getData(params);

  return (
    <Box sx={{ px: 3 }} data-sb-object-id={page.__metadata.id}>
      <Container maxWidth="lg" disableGutters={true}>
        {/* <Head>
          <title>{page.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {site.favicon && <link rel="icon" href={site.favicon} />}
        </Head> */}
        {site.header && <Header {...site.header} data-sb-object-id={site.__metadata.id} />}
        {(page.sections ?? []).length > 0 && (
          <Box component="main" data-sb-field-path="sections">
            {(page.sections ?? []).map((section, index) => (
              <DynamicComponent key={index} {...section} data-sb-field-path={`.${index}`} />
            ))}
          </Box>
        )}
        {site.footer && <Footer {...site.footer} data-sb-object-id={site.__metadata.id} />}
      </Container>
    </Box>
  );
}
