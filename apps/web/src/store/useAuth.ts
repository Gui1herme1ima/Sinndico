import { useContext } from 'react';

import { AuthContext } from '@/store/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }

  const { state, login, logout, refreshUser } = ctx;

  return {
    status: state.status,
    user: state.status === 'authenticated' ? state.user : null,
    login,
    logout,
    refreshUser,
  };
}
