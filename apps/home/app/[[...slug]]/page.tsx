import { pagesByType } from '@cabbage-cms/api';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  // get a list of all url paths and map them into string segments split by '/
  // Examples:
  // / = []
  // /about = ['about']
  // /articles/00-hello-world = ['articles', '00-hello-world']
  const pages = pagesByType('Page');
  console.log('pages = ', pages);

  return [{ slug: [] }, { slug: ['about'] }];
}

// export const getStaticPaths: GetStaticPaths = () => {
//
//   return {
//     paths: Object.keys(pages),
//     fallback: false,
//   };
// };

// export const getStaticProps: GetStaticProps<Props, { slug: string[] }> = ({ params }) => {
//   const url = '/' + (params?.slug || []).join('/');
//   const page = urlToContent(url) as types.Page;
//   return { props: { page, siteConfig: siteConfig() } };
// };

// type Props = { page: types.IPageProps; site: types.ConfigProps };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Page(props: any) {
  console.log('Page(props)', props);

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body1" gutterBottom>
          Dynamic Page
        </Typography>
      </Box>
    </Container>
  );

  // return (
  //   <MuiBox sx={{ px: 3 }} data-sb-object-id={page.__metadata.id}>
  //     <MuiContainer maxWidth="lg" disableGutters={true}>
  //       <Head>
  //         <title>{page.title}</title>
  //         <meta name="viewport" content="width=device-width, initial-scale=1" />
  //         {site.favicon && <link rel="icon" href={site.favicon} />}
  //       </Head>
  //       {site.header && <Header {...site.header} data-sb-object-id={site.__metadata.id} />}
  //       {(page.sections ?? []).length > 0 && (
  //         <MuiBox component="main" data-sb-field-path="sections">
  //           {(page.sections ?? []).map((section, index) => (
  //             <DynamicComponent key={index} {...section} data-sb-field-path={`.${index}`} />
  //           ))}
  //         </MuiBox>
  //       )}
  //       {site.footer && <Footer {...site.footer} data-sb-object-id={site.__metadata.id} />}
  //     </MuiContainer>
  //   </MuiBox>
  // );
}
