import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { ApiError } from '@/services/api/client';
import { condominiosApi } from '@/services/api/condominiosApi';
import { useAuth } from '@/store/useAuth';

export function LoginPage() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const { login } = useAuth();
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const condominioQuery = useQuery({
    queryKey: ['condominio-by-slug', tenantSlug],
    queryFn: () => condominiosApi.getBySlug(tenantSlug!),
    enabled: Boolean(tenantSlug),
    retry: false,
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ identificador, senha });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  if (tenantSlug && condominioQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  if (tenantSlug && condominioQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <Logo size={40} />
        <p className="text-text-secondary">Condomínio não encontrado.</p>
      </div>
    );
  }

  const forgotPasswordPath = tenantSlug ? `/${tenantSlug}/esqueci-senha` : '/esqueci-senha';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Logo size={40} />
      <Card className="w-full max-w-sm" title={condominioQuery.data?.nome ?? 'Entrar'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail ou usuário"
            autoComplete="username"
            required
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">
          <Link to={forgotPasswordPath} className="font-medium text-primary hover:underline">
            Esqueci minha senha
          </Link>
        </p>
      </Card>
    </div>
  );
}
