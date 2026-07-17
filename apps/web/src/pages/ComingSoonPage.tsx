import { Card } from '@/components/ui/Card';

export interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <Card title={title}>
      <p className="text-text-secondary">
        {description ?? 'Esta tela ainda está em construção — chega em uma próxima sessão.'}
      </p>
    </Card>
  );
}
