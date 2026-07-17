import { Outlet } from 'react-router-dom';

import { Header } from '@/components/Layout/Header';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
