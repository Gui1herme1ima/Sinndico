import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { ApiError } from '@/services/api/client';
import { authApi } from '@/services/api/authApi';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenHash = searchParams.get('token_hash') ?? '';
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.resetPassword({ tokenHash, novaSenha });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Link inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  }

  if (!tokenHash) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <Logo size={40} />
        <p className="text-text-secondary">Link de redefinição inválido ou incompleto.</p>
        <Link to="/login" className="font-medium text-primary hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Logo size={40} />
      <Card className="w-full max-w-sm" title="Redefinir senha">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Redefinir senha
          </Button>
        </form>
      </Card>
    </div>
  );
}
