'use client';

import { useEffect, useState, useCallback } from 'react';
import { invalidateCurrentUser } from '@/lib/client/current-user';

export interface AccountInfo {
  id: string;
  label: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  avatar_config: unknown;
  unreadCount?: number;
}

export function useSavedAccounts(activeUserId?: string) {
  const [savedAccount, setSavedAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/accounts', { cache: 'no-store' });
      if (!response.ok) {
        setSavedAccount(null);
        return;
      }
      const data = await response.json();
      setSavedAccount(data.saved ?? null);
    } catch {
      setSavedAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAccounts();

    const handleUpdate = () => {
      void refreshAccounts();
    };
    window.addEventListener('stacklyst:accounts-updated', handleUpdate);
    return () => window.removeEventListener('stacklyst:accounts-updated', handleUpdate);
  }, [refreshAccounts, activeUserId]);

  const switchAccount = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível trocar de conta.');
      invalidateCurrentUser();
      sessionStorage.removeItem('stacklyst_user');
      window.dispatchEvent(new CustomEvent('stacklyst:accounts-updated'));
      window.location.assign('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível trocar de conta.');
      setBusy(false);
    }
  };

  const addAccount = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save' }),
      });
      if (!response.ok && response.status !== 409) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Não foi possível adicionar a conta.');
      }
      window.dispatchEvent(new CustomEvent('stacklyst:accounts-updated'));
      window.location.assign('/login?addAccount=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível adicionar a conta.');
      setBusy(false);
    }
  };

  const removeSavedAccount = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/accounts', { method: 'DELETE' });
      if (!response.ok) throw new Error('Não foi possível remover a conta.');
      setSavedAccount(null);
      window.dispatchEvent(new CustomEvent('stacklyst:accounts-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover a conta.');
    } finally {
      setBusy(false);
    }
  };

  return {
    savedAccount,
    loading,
    busy,
    error,
    refreshAccounts,
    switchAccount,
    addAccount,
    removeSavedAccount,
  };
}
