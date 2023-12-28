import { Button } from '@spotlight/components/Button';
import { Container } from '@spotlight/components/Container';

export default function NotFound() {
  return (
    <Container className="flex h-full items-center pt-16 sm:pt-32">
      <div className="flex flex-col items-center">
        <p className="text-base font-semibold text-neutral-400 dark:text-neutral-500">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <Button href="/" variant="secondary" className="mt-4">
          Go back home
        </Button>
      </div>
    </Container>
  );
}
