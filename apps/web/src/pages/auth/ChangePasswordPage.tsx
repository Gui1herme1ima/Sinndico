import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { ApiError } from '@/services/api/client';
import { authApi } from '@/services/api/authApi';
import { roleHome } from '@/routes/roleHome';
import { useAuth } from '@/store/useAuth';

export function ChangePasswordPage() {
  const { refreshUser, logout, user } = useAuth();
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.changePassword({ novaSenha });
      await refreshUser();
      navigate(user ? roleHome(user.role) : '/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao trocar a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Logo size={40} />
      <Card className="w-full max-w-sm" title="Troque sua senha">
        <p className="mb-4 text-sm text-text-secondary">
          Esta é a primeira vez que você acessa o sistema. Defina uma nova senha para continuar.
        </p>
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
            Trocar senha
          </Button>
        </form>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-4 w-full text-center text-sm text-text-secondary hover:underline"
        >
          Sair
        </button>
      </Card>
    </div>
  );
}
