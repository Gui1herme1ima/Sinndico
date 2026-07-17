import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { ApiError } from '@/services/api/client';
import { useAuth } from '@/store/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const [condominioId, setCondominioId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [apto, setApto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [role, setRole] = useState<'morador' | 'admin'>('morador');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        condominioId,
        email,
        senha,
        nome,
        apto: apto || undefined,
        telefone: telefone || undefined,
        role,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao registrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm" title="Criar conta">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="ID do condomínio"
            helperText="Peça ao síndico/administradora o identificador do condomínio."
            required
            value={condominioId}
            onChange={(e) => setCondominioId(e.target.value)}
          />
          <Input label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            helperText="Mínimo de 8 caracteres."
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Input label="Apartamento (opcional)" value={apto} onChange={(e) => setApto(e.target.value)} />
          <Input label="Telefone (opcional)" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">Perfil</span>
            <div className="flex gap-2">
              {(['morador', 'admin'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors duration-200',
                    role === option
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:bg-text-primary/5',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Criar conta
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
