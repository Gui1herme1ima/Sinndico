import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-text-primary">404</h1>
      <p className="text-text-secondary">Essa página não existe.</p>
      <Link to="/">
        <Button variant="secondary">Voltar ao início</Button>
      </Link>
    </div>
  );
}
