import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { ApiError } from '@/services/api/client';
import { authApi } from '@/services/api/authApi';

export function ForgotPasswordPage() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginPath = tenantSlug ? `/${tenantSlug}/login` : '/login';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao enviar o link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Logo size={40} />
      <Card className="w-full max-w-sm" title="Esqueci minha senha">
        {sent ? (
          <p className="text-text-secondary">
            Se existir uma conta com este e-mail, enviamos um link de redefinição de senha.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Enviar link
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-text-secondary">
          <Link to={loginPath} className="font-medium text-primary hover:underline">
            Voltar para o login
          </Link>
        </p>
      </Card>
    </div>
  );
}
