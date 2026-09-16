import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { focusManager, onlineManager, useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { queryClient } from './query';
import { api } from './api';
import type { Person } from './types';
const Context = createContext<{ session: Session | null; ready: boolean }>({
  session: null,
  ready: false,
});
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ session: Session | null; ready: boolean }>({
    session: null,
    ready: false,
  });
  const user = useRef<string | undefined>(undefined);
  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;
    const apply = (session: Session | null) => {
      if (!active) return;
      if (user.current !== session?.user.id) {
        void queryClient.cancelQueries();
        queryClient.clear();
        user.current = session?.user.id;
      }
      setState({ session, ready: true });
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      receivedAuthEvent = true;
      apply(session);
    });
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!receivedAuthEvent) apply(data.session);
      })
      .catch(() => {
        if (!receivedAuthEvent) apply(null);
      });
    const activate = (s: string) => {
      focusManager.setFocused(s === 'active');
      if (s === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };
    activate(AppState.currentState);
    const app = AppState.addEventListener('change', activate);
    const network = NetInfo.addEventListener((s) =>
      onlineManager.setOnline(s.isConnected !== false && s.isInternetReachable !== false)
    );
    return () => {
      active = false;
      subscription.unsubscribe();
      app.remove();
      network();
      supabase.auth.stopAutoRefresh();
    };
  }, []);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export const useSession = () => useContext(Context);
export function useMe() {
  const { session } = useSession();
  return useQuery({
    queryKey: ['me', session?.user.id],
    queryFn: () => api<Person>('/api/users/me'),
    enabled: !!session,
  });
}
