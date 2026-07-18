import { Nav } from '@/components/Layout/Nav';
import { useAuth } from '@/store/useAuth';

export function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-border bg-surface p-4 md:block">
      <Nav role={user.role} permissoesPorteiro={user.permissoesPorteiro} />
    </aside>
  );
}
